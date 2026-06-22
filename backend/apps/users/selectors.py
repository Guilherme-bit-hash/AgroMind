# apps/users/selectors.py
# Python 3.12+ | Django 5.x
#
# Selectors são responsáveis EXCLUSIVAMENTE por consultas ao banco.
# Nenhuma lógica de negócio aqui — apenas queries.

from __future__ import annotations

from .models import CustomUser, LoginAudit


def get_user_by_email(email: str) -> CustomUser | None:
    """
    Busca um usuário pelo e-mail.
    Retorna None se não encontrado — nunca levanta exceção.
    """
    try:
        return CustomUser.objects.get(email=email.strip().lower())
    except CustomUser.DoesNotExist:
        return None


def get_user_by_id(user_id: int) -> CustomUser | None:
    """Busca um usuário pelo PK. Retorna None se não encontrado."""
    try:
        return CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return None


def get_active_users() -> "QuerySet[CustomUser]":
    """Retorna todos os usuários ativos, ordenados por nome."""
    return CustomUser.objects.filter(is_active=True).order_by("name")


def get_users_by_role(role: str) -> "QuerySet[CustomUser]":
    """Retorna todos os usuários ativos de um determinado perfil."""
    return CustomUser.objects.filter(role=role, is_active=True).order_by("name")


def get_login_audit_by_user(user: CustomUser) -> "QuerySet[LoginAudit]":
    """Retorna o histórico de login de um usuário, do mais recente ao mais antigo."""
    return LoginAudit.objects.filter(user=user).order_by("-timestamp")


def get_failed_logins_by_ip(ip_address: str, limit: int = 10) -> "QuerySet[LoginAudit]":
    """
    Retorna as últimas tentativas falhas de login de um IP específico.
    Útil para implementar bloqueio por força bruta no futuro.
    """
    return (
        LoginAudit.objects
        .filter(ip_address=ip_address, success=False)
        .order_by("-timestamp")[:limit]
    )