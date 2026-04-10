# apps/users/tests/test_views.py
# Python 3.12+ | Django 5.x
import pytest
from django.urls import reverse
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from apps.users.models import CustomUser, LoginAudit
from .factories import AdminFactory, UserFactory


# ===========================================================================
# Fixtures reutilizáveis
# ===========================================================================

@pytest.fixture
def usuario(db):
    """Cria e retorna um usuário produtor ativo."""
    return UserFactory()


@pytest.fixture
def admin(db):
    """Cria e retorna um usuário administrador."""
    return AdminFactory()


@pytest.fixture
def cliente_autenticado(client, usuario):
    """Retorna um client Django já autenticado com o usuário produtor."""
    client.force_login(usuario)
    return client


# ===========================================================================
# RF-01 | Cadastro
# ===========================================================================

class TestCadastro:

    def test_exibe_formulario_de_cadastro(self, client, db):
        """GET /usuarios/cadastro/ deve retornar status 200."""
        url      = reverse("users:register")
        response = client.get(url)

        assert response.status_code == 200
        assert "form" in response.context

    def test_cadastro_com_dados_validos(self, client, db):
        """POST com dados válidos deve criar o usuário e redirecionar para login."""
        url      = reverse("users:register")
        response = client.post(url, {
            "name":      "João da Silva",
            "email":     "joao@teste.com.br",
            "password1": "Teste@1234",
            "password2": "Teste@1234",
        })

        assert response.status_code == 302
        assert response["Location"] == reverse("users:login")
        assert CustomUser.objects.filter(email="joao@teste.com.br").exists()

    def test_cadastro_com_email_duplicado(self, client, db, usuario):
        """POST com e-mail já cadastrado deve retornar erro no formulário."""
        url      = reverse("users:register")
        response = client.post(url, {
            "name":      "Outro Nome",
            "email":     usuario.email,  # e-mail já existe
            "password1": "Teste@1234",
            "password2": "Teste@1234",
        })

        assert response.status_code == 200
        assert "já está cadastrado" in response.content.decode()

    def test_cadastro_com_senhas_diferentes(self, client, db):
        """POST com senhas divergentes deve retornar erro de validação."""
        url      = reverse("users:register")
        response = client.post(url, {
            "name":      "Maria Souza",
            "email":     "maria@teste.com.br",
            "password1": "Teste@1234",
            "password2": "SenhaErrada@1",
        })

        assert response.status_code == 200
        assert not CustomUser.objects.filter(email="maria@teste.com.br").exists()

    def test_cadastro_com_senha_fraca(self, client, db):
        """POST com senha muito curta deve ser rejeitado pelos validadores."""
        url      = reverse("users:register")
        response = client.post(url, {
            "name":      "Pedro Lima",
            "email":     "pedro@teste.com.br",
            "password1": "123",
            "password2": "123",
        })

        assert response.status_code == 200
        assert not CustomUser.objects.filter(email="pedro@teste.com.br").exists()

    def test_usuario_autenticado_redireciona_para_dashboard(self, cliente_autenticado, db):
        """Usuário já logado não deve acessar a página de cadastro."""
        url      = reverse("users:register")
        response = cliente_autenticado.get(url)

        assert response.status_code == 302
        assert "dashboard" in response["Location"]


# ===========================================================================
# RF-02 | Login
# ===========================================================================

class TestLogin:

    def test_exibe_formulario_de_login(self, client, db):
        """GET /usuarios/login/ deve retornar status 200."""
        url      = reverse("users:login")
        response = client.get(url)

        assert response.status_code == 200
        assert "form" in response.context

    def test_login_com_credenciais_validas(self, client, db, usuario):
        """POST com credenciais corretas deve autenticar e redirecionar."""
        url      = reverse("users:login")
        response = client.post(url, {
            "email":    usuario.email,
            "password": "Teste@1234",
        })

        assert response.status_code == 302
        assert "dashboard" in response["Location"]

    def test_login_com_credenciais_invalidas(self, client, db, usuario):
        """POST com senha errada deve retornar erro e NÃO autenticar."""
        url      = reverse("users:login")
        response = client.post(url, {
            "email":    usuario.email,
            "password": "SenhaErrada@99",
        })

        assert response.status_code == 200
        assert "inválidos" in response.content.decode()

    def test_login_registra_auditoria_de_sucesso(self, client, db, usuario):
        """Login bem-sucedido deve gerar registro no LoginAudit com success=True."""
        url = reverse("users:login")
        client.post(url, {
            "email":    usuario.email,
            "password": "Teste@1234",
        })

        auditoria = LoginAudit.objects.filter(
            email_attempt=usuario.email,
            success=True,
        ).first()

        assert auditoria is not None
        assert auditoria.ip_address is not None

    def test_login_registra_auditoria_de_falha(self, client, db, usuario):
        """Login com senha errada deve gerar registro no LoginAudit com success=False."""
        url = reverse("users:login")
        client.post(url, {
            "email":    usuario.email,
            "password": "SenhaErrada@99",
        })

        auditoria = LoginAudit.objects.filter(
            email_attempt=usuario.email,
            success=False,
        ).first()

        assert auditoria is not None

    def test_login_com_email_inexistente_registra_auditoria(self, client, db):
        """Tentativa com e-mail que não existe deve ser registrada na auditoria."""
        url = reverse("users:login")
        client.post(url, {
            "email":    "naoexiste@teste.com.br",
            "password": "Qualquer@1234",
        })

        auditoria = LoginAudit.objects.filter(
            email_attempt="naoexiste@teste.com.br",
            success=False,
        ).first()

        assert auditoria is not None

    def test_login_com_usuario_inativo(self, client, db):
        """Usuário desativado não deve conseguir fazer login."""
        usuario  = UserFactory(is_active=False)
        url      = reverse("users:login")
        response = client.post(url, {
            "email":    usuario.email,
            "password": "Teste@1234",
        })

        assert response.status_code == 200
        assert "desativada" in response.content.decode()

    def test_usuario_autenticado_redireciona_para_dashboard(self, cliente_autenticado, db):
        """Usuário já logado não deve acessar a página de login."""
        url      = reverse("users:login")
        response = cliente_autenticado.get(url)

        assert response.status_code == 302


# ===========================================================================
# RF-02 | Logout
# ===========================================================================

class TestLogout:

    def test_logout_encerra_sessao(self, cliente_autenticado, db):
        """POST em /logout/ deve encerrar a sessão e redirecionar para login."""
        url      = reverse("users:logout")
        response = cliente_autenticado.post(url)

        assert response.status_code == 302
        assert "login" in response["Location"]

    def test_logout_via_get_redireciona_para_dashboard(self, cliente_autenticado, db):
        """GET em /logout/ deve redirecionar para dashboard sem encerrar sessão."""
        url      = reverse("users:logout")
        response = cliente_autenticado.get(url)

        assert response.status_code == 302
        assert "dashboard" in response["Location"]

    def test_logout_sem_autenticacao_redireciona_para_login(self, client, db):
        """Usuário não autenticado tentando acessar /logout/ vai para login."""
        url      = reverse("users:logout")
        response = client.post(url)

        assert response.status_code == 302
        assert "login" in response["Location"]


# ===========================================================================
# RF-02 | Dashboard
# ===========================================================================

class TestDashboard:

    def test_dashboard_requer_autenticacao(self, client, db):
        """Acesso sem login deve redirecionar para a tela de login."""
        url      = reverse("users:dashboard")
        response = client.get(url)

        assert response.status_code == 302
        assert "login" in response["Location"]

    def test_dashboard_acessivel_para_usuario_autenticado(self, cliente_autenticado, db):
        """Usuário autenticado deve acessar o dashboard com status 200."""
        url      = reverse("users:dashboard")
        response = cliente_autenticado.get(url)

        assert response.status_code == 200
        assert "user" in response.context


# ===========================================================================
# RF-03 | Recuperação de senha
# ===========================================================================

class TestRecuperacaoDeSenha:

    def test_exibe_formulario_de_recuperacao(self, client, db):
        """GET /usuarios/senha/recuperar/ deve retornar status 200."""
        url      = reverse("users:password_reset_request")
        response = client.get(url)

        assert response.status_code == 200

    def test_solicitacao_com_email_existente(self, client, db, usuario):
        """POST com e-mail cadastrado deve exibir mensagem de sucesso."""
        url      = reverse("users:password_reset_request")
        response = client.post(url, {"email": usuario.email})

        assert response.status_code == 200
        assert response.context["success"] is True

    def test_solicitacao_com_email_inexistente(self, client, db):
        """
        POST com e-mail não cadastrado deve retornar a mesma mensagem de sucesso.
        Isso é intencional — evita enumeração de contas.
        """
        url      = reverse("users:password_reset_request")
        response = client.post(url, {"email": "naoexiste@teste.com.br"})

        assert response.status_code == 200
        assert response.context["success"] is True

    def test_acessa_tela_de_confirmacao_de_senha(self, client, db):
        """GET em /usuarios/senha/redefinir/<uidb64>/<token>/ deve retornar 200."""
        user = UserFactory()
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        
        url = reverse("users:password_reset_confirm", kwargs={'uidb64': uidb64, 'token': token})
        response = client.get(url)

        assert response.status_code == 200
        assert "form" in response.context

    def test_envia_nova_senha_e_muda_com_sucesso(self, client, db):
        """POST válido na página de confirmação altera a senha e redireciona (302)."""
        user = UserFactory(password="senha-velha123")
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        
        url = reverse("users:password_reset_confirm", kwargs={'uidb64': uidb64, 'token': token})
        
        response = client.post(url, {
            "new_password1": "NovaSenhaMassa@12",
            "new_password2": "NovaSenhaMassa@12",
        })

        assert response.status_code == 302
        assert response["Location"] == reverse("users:password_reset_done")
        
        user.refresh_from_db()
        assert user.check_password("NovaSenhaMassa@12") is True

    def test_acessa_tela_de_sucesso_done(self, client, db):
        """GET em /usuarios/senha/redefinida/ deve retornar 200 e mensagem de sucesso."""
        url = reverse("users:password_reset_done")
        response = client.get(url)

        assert response.status_code == 200
        assert "Senha Redefinida!" in response.content.decode()


# ===========================================================================
# RF-04 | RBAC — Perfis de usuário
# ===========================================================================

class TestPerfis:

    def test_usuario_produtor_tem_role_correto(self, db):
        """Usuário criado sem role explícito deve ter role PRODUTOR."""
        usuario = UserFactory()
        assert usuario.role == CustomUser.Role.PRODUTOR
        assert usuario.is_produtor is True
        assert usuario.is_admin is False

    def test_usuario_admin_tem_role_correto(self, db):
        """AdminFactory deve criar usuário com role ADMIN."""
        admin = AdminFactory()
        assert admin.role == CustomUser.Role.ADMIN
        assert admin.is_admin is True
        assert admin.is_produtor is False

    def test_senha_armazenada_com_bcrypt(self, db):
        """A senha do usuário deve ser armazenada com hash BCrypt."""
        usuario = UserFactory()
        assert usuario.password.startswith("bcrypt_sha256$")