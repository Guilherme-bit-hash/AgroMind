# apps/users/views.py
# Python 3.12+ | Django 5.x

from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.shortcuts import redirect, render

from .models import CustomUser

from .forms import (
    LoginForm,
    PasswordResetConfirmForm,
    PasswordResetRequestForm,
    RegisterForm,
)
from .services import (
    confirm_password_reset,
    login_user,
    logout_user,
    register_user,
    request_password_reset,
)


# ---------------------------------------------------------------------------
# RF-01 | Cadastro
# ---------------------------------------------------------------------------

def register_view(request):
    """
    GET  → exibe o formulário de cadastro.
    POST → processa o cadastro via service e redireciona para o login.
    """
    if request.user.is_authenticated:
        return redirect("users:dashboard")

    form = RegisterForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        try:
            register_user(
                name     = form.cleaned_data["name"],
                email    = form.cleaned_data["email"],
                password = form.cleaned_data["password1"],
            )
            return redirect("users:login")
        except ValidationError as e:
            form.add_error(None, e)

    return render(request, "users/register.html", {"form": form})


# ---------------------------------------------------------------------------
# RF-02 | Login
# ---------------------------------------------------------------------------

def login_view(request):
    """
    GET  → exibe o formulário de login.
    POST → autentica via service, registra auditoria e redireciona.
    """
    if request.user.is_authenticated:
        return redirect("users:dashboard")

    form = LoginForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        try:
            login_user(
                request,
                email    = form.cleaned_data["email"],
                password = form.cleaned_data["password"],
            )
            # Redireciona para a URL solicitada antes do login, ou para o dashboard
            next_url = request.GET.get("next", "users:dashboard")
            return redirect(next_url)
        except ValidationError as e:
            form.add_error(None, e)

    return render(request, "users/login.html", {"form": form})


# ---------------------------------------------------------------------------
# RF-02 | Logout
# ---------------------------------------------------------------------------

@login_required
def logout_view(request):
    """
    Apenas POST é aceito para logout — protege contra logout via GET
    (ataques CSRF poderiam deslogar o usuário com um simples link).
    """
    if request.method == "POST":
        logout_user(request)
        return redirect("users:login")
    return redirect("users:dashboard")


# ---------------------------------------------------------------------------
# RF-03 | Recuperação de senha — views
# ---------------------------------------------------------------------------

def password_reset_request_view(request):
    """
    GET  → exibe formulário de solicitação.
    POST → envia e-mail via service e redireciona para confirmação.
    """
    if request.user.is_authenticated:
        return redirect("users:dashboard")

    form = PasswordResetRequestForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        try:
            request_password_reset(request, email=form.cleaned_data["email"])
            return render(request, "users/password_reset_request.html", {
                "form": form,
                "success": True,
            })
        except ValidationError as e:
            form.add_error(None, e)

    return render(request, "users/password_reset_request.html", {"form": form})


def password_reset_confirm_view(request, uidb64, token):
    """
    GET  → exibe formulário de redefinição.
    POST → confirma via service e redireciona para o login.
    """
    form = PasswordResetConfirmForm(request.POST or None, uidb64=uidb64, token=token)

    if request.method == "POST" and form.is_valid():
        try:
            confirm_password_reset(uidb64=uidb64, token=token, new_password=form.cleaned_data["new_password1"])
            return redirect("users:password_reset_done")
        except ValidationError as e:
            form.add_error(None, e)

    return render(request, "users/password_reset_confirm.html", {"form": form})


# ---------------------------------------------------------------------------
# RF-03 | Páginas de status
# ---------------------------------------------------------------------------

def password_reset_done_view(request):
    """Página exibida após solicitação bem-sucedida do link de redefinição."""
    return render(request, "users/password_reset_done.html")


def password_reset_complete_view(request):
    """Página exibida após redefinição bem-sucedida da senha."""
    return render(request, "users/password_reset_complete.html")


# ---------------------------------------------------------------------------
# RF-04 | Dashboard
# ---------------------------------------------------------------------------

@login_required
def dashboard_view(request):
    """Dashboard genérico — exibe o painel principal do usuário."""
    return render(request, "users/dashboard.html", {"user": request.user})


# Adicionar ao final de apps/users/views.py

from .decorators import admin_required
from .forms import AdminUserCreateForm
from .selectors import get_active_users


# ---------------------------------------------------------------------------
# CRUD de Usuários — Acesso restrito a Administradores
# ---------------------------------------------------------------------------

@admin_required
def user_list_view(request):
    """
    Lista todos os usuários ativos do sistema.
    Acesso restrito ao Administrador via @admin_required.

    Suporta busca simples por nome ou e-mail via query string ?q=termo.
    """
    query    = request.GET.get("q", "").strip()
    usuarios = get_active_users()

    if query:
        usuarios = usuarios.filter(
            # Filtra por nome OU e-mail contendo o termo buscado
            # icontains = case-insensitive contains
            name__icontains  = query
        ) | usuarios.filter(
            email__icontains = query
        )

    return render(request, "users/admin/user_list.html", {
        "usuarios": usuarios,
        "query":    query,
    })


@admin_required
def user_create_view(request):
    """
    Criação de novo usuário pelo Administrador.
    GET  → exibe o formulário.
    POST → valida, cria via service e redireciona para a listagem.
    """
    form = AdminUserCreateForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        try:
            register_user(
                name     = form.cleaned_data["name"],
                email    = form.cleaned_data["email"],
                password = form.cleaned_data["password1"],
                role     = form.cleaned_data["role"],
            )
            return redirect("users:user_list")
        except ValidationError as e:
            form.add_error(None, e)

    return render(request, "users/admin/user_create.html", {"form": form})