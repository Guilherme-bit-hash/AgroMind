# apps/users/services.py
# Python 3.12+ | Django 5.x

from __future__ import annotations

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.http import HttpRequest
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .models import CustomUser, LoginAudit
from .selectors import get_user_by_email


# ---------------------------------------------------------------------------
# Imports helpers internos 
# ---------------------------------------------------------------------------

def _get_client_ip(request: HttpRequest) -> str:
    """
    Extrai o IP real do cliente da requisição.

    Verifica primeiro o header X-Forwarded-For, usado por proxies e
    balanceadores de carga. Se não existir, usa o REMOTE_ADDR direto.
    Sempre retorna o primeiro IP da cadeia (o do cliente original).
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "0.0.0.0")


def _get_user_agent(request: HttpRequest) -> str:
    """Retorna o User-Agent do cliente ou string vazia se ausente."""
    return request.META.get("HTTP_USER_AGENT", "")


def _register_login_audit(
    request: HttpRequest,
    email: str,
    success: bool,
    user: CustomUser | None = None,
) -> None:
    """
    Registra uma tentativa de login na tabela login_audit.
    Chamado tanto para logins bem-sucedidos quanto falhos.
    Nunca levanta exceção — auditoria não pode quebrar o fluxo de login.
    """
    try:
        LoginAudit.objects.create(
            user          = user,
            email_attempt = email,
            ip_address    = _get_client_ip(request),
            user_agent    = _get_user_agent(request),
            success       = success,
        )
    except Exception:
        # Falha silenciosa intencional: se a auditoria falhar por qualquer
        # motivo (ex: banco instável), o login do usuário não deve ser afetado.
        pass


# ---------------------------------------------------------------------------
# RF-01 | Cadastro de usuário
# ---------------------------------------------------------------------------

def register_user(
    *,
    name: str,
    email: str,
    password: str,
    role: str = CustomUser.Role.PRODUTOR,
) -> CustomUser:
    """
    Cria um novo usuário no sistema.

    Parâmetros nomeados (keyword-only via *) para evitar erros de
    posicionamento ao chamar o service.

    Levanta ValidationError se o e-mail já estiver cadastrado.
    """
    email = email.strip().lower()

    if CustomUser.objects.filter(email=email).exists():
        raise ValidationError("Já existe um usuário cadastrado com este e-mail.")

    user = CustomUser.objects.create_user(
        email    = email,
        password = password,
        name     = name.strip(),
        role     = role,
    )
    return user


# ---------------------------------------------------------------------------
# RF-02 | Login com auditoria de IP
# ---------------------------------------------------------------------------

def login_user(
    request: HttpRequest,
    *,
    email: str,
    password: str,
) -> CustomUser:
    """
    Autentica o usuário e inicia a sessão.

    Fluxo:
    1. Tenta autenticar com email + senha via backend do Django.
    2. Se falhar → registra tentativa falha e levanta ValidationError.
    3. Se o usuário estiver inativo → registra e levanta ValidationError.
    4. Se sucesso → inicia sessão e registra auditoria de sucesso.

    Retorna o objeto CustomUser autenticado.
    """
    email = email.strip().lower()

    # Verifica se o usuário existe mas está inativo ANTES de authenticate.
    # O ModelBackend do Django retorna None para inativos, impedindo
    # distinguir "senha errada" de "conta desativada" após o authenticate.
    inactive_user = CustomUser.objects.filter(email=email, is_active=False).first()
    if inactive_user is not None:
        _register_login_audit(request, email=email, success=False, user=inactive_user)
        raise ValidationError("Esta conta está desativada. Entre em contato com o administrador.")

    user = authenticate(request, username=email, password=password)

    if user is None:
        # Registra a tentativa falha — usuário pode não existir
        _register_login_audit(request, email=email, success=False, user=None)
        raise ValidationError("E-mail ou senha inválidos.")

    if not user.is_active:
        _register_login_audit(request, email=email, success=False, user=user)
        raise ValidationError("Esta conta está desativada. Entre em contato com o administrador.")

    # Login bem-sucedido
    login(request, user)
    _register_login_audit(request, email=email, success=True, user=user)

    return user


# ---------------------------------------------------------------------------
# RF-02 | Logout
# ---------------------------------------------------------------------------

def logout_user(request: HttpRequest) -> None:
    """
    Encerra a sessão do usuário atual.
    O Django invalida o cookie de sessão e remove o registro do banco.
    """
    logout(request)


# ---------------------------------------------------------------------------
# RF-03 | Recuperação de senha — envio do e-mail
# ---------------------------------------------------------------------------

def request_password_reset(request: HttpRequest, *, email: str) -> None:
    """
    Gera um token de redefinição de senha e envia o link por e-mail.

    Decisão de segurança importante: mesmo que o e-mail não exista no banco,
    a função retorna normalmente SEM levantar exceção. Isso impede que um
    atacante descubra quais e-mails estão cadastrados no sistema através
    de respostas diferentes (enumeração de contas).
    """
    email = email.strip().lower()
    user  = get_user_by_email(email)

    if user is None:
        # Retorno silencioso intencional — não revela se o e-mail existe
        return

    # Gera o token assinado e o UID codificado em base64
    token = default_token_generator.make_token(user)
    uid   = urlsafe_base64_encode(force_bytes(user.pk))

    # Monta o link completo de redefinição
    from django.urls import reverse
    domain       = get_current_site(request).domain
    path         = reverse('users:password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
    reset_link   = f"http://{domain}{path}"

    # Renderiza o corpo do e-mail a partir de um template
    email_body = render_to_string(
        "users/emails/password_reset.txt",
        {
            "user":       user,
            "reset_link": reset_link,
            "domain":     domain,
        },
    )

    send_mail(
        subject      = "AgroGestão — Redefinição de senha",
        message      = email_body,
        from_email   = None,  # usa DEFAULT_FROM_EMAIL do settings
        recipient_list = [user.email],
        fail_silently  = False,
    )


# ---------------------------------------------------------------------------
# RF-03 | Recuperação de senha — confirmação do token e nova senha
# ---------------------------------------------------------------------------

def confirm_password_reset(
    *,
    uidb64: str,
    token: str,
    new_password: str,
) -> CustomUser:
    """
    Valida o token de redefinição e aplica a nova senha.

    Fluxo:
    1. Decodifica o UID em base64 para obter o PK do usuário.
    2. Busca o usuário no banco.
    3. Valida o token (verifica assinatura e expiração via PASSWORD_RESET_TIMEOUT).
    4. Aplica a nova senha com hash BCrypt.
    5. Invalida o token (tokens são de uso único no Django).

    Levanta ValidationError em qualquer etapa que falhe.
    """
    try:
        uid  = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        raise ValidationError("Link de redefinição inválido ou expirado.")

    if not default_token_generator.check_token(user, token):
        raise ValidationError("Link de redefinição inválido ou expirado.")

    user.set_password(new_password)  # aplica hash BCrypt automaticamente
    user.save()

    return user


# ---------------------------------------------------------------------------
# Administração de usuários (uso interno / admin)
# ---------------------------------------------------------------------------

def deactivate_user(*, user_id: int) -> CustomUser:
    """
    Desativa um usuário sem deletá-lo do banco.
    Preserva histórico financeiro e operacional vinculado ao usuário.
    """
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        raise ValidationError("Usuário não encontrado.")

    user.is_active = False
    user.save(update_fields=["is_active", "updated_at"])
    return user


def change_user_role(*, user_id: int, new_role: str) -> CustomUser:
    """
    Altera o perfil (role) de um usuário existente.
    Valida se o novo role é um valor permitido pelo enum Role.
    """
    if new_role not in CustomUser.Role.values:
        raise ValidationError(
            f"Perfil inválido. Valores aceitos: {', '.join(CustomUser.Role.values)}"
        )

    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        raise ValidationError("Usuário não encontrado.")

    user.role = new_role
    user.save(update_fields=["role", "updated_at"])
    return user