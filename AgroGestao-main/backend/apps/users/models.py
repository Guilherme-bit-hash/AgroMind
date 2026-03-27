# apps/users/models.py
# Python 3.12+ | Django 5.x

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from .managers import CustomUserManager


class CustomUser(AbstractUser):
    """
    Modelo de usuário customizado que substitui o User padrão do Django.

    Decisões:
    - `username` removido: autenticação feita exclusivamente por e-mail.
    - `name` substitui `first_name`/`last_name` por simplicidade (RF-01).
    - `role` implementa o RBAC simples exigido na Sprint 01 (RF-04).
    - `is_active` já vem do AbstractUser — reutilizado para ativação de conta.
    """

    class Role(models.TextChoices):
        """
        Enum de perfis com valores guardados no banco e labels legíveis.
        TextChoices é preferível a IntegerChoices aqui porque o valor
        salvo no banco é autoexplicativo em queries SQL diretas.
        """
        ADMIN    = "ADMIN",    "Administrador"
        PRODUTOR = "PRODUTOR", "Produtor"

    # --- Campos substituídos ---
    username = None  # Remove o campo username herdado do AbstractUser

    # --- Campos do RF-01 ---
    email = models.EmailField(
        verbose_name="E-mail",
        unique=True,
        db_index=True,   # índice explícito: e-mail é campo de busca frequente
    )
    name = models.CharField(
        verbose_name="Nome completo",
        max_length=150,
    )

    # --- RF-04: Controle de perfil ---
    role = models.CharField(
        verbose_name="Perfil",
        max_length=20,
        choices=Role.choices,
        default=Role.PRODUTOR,
        db_index=True,   # índice para queries de filtro por perfil
    )

    # --- Auditoria de conta ---
    created_at = models.DateTimeField(
        verbose_name="Criado em",
        default=timezone.now,
        editable=False,
    )
    updated_at = models.DateTimeField(
        verbose_name="Atualizado em",
        auto_now=True,
    )

    # --- Configuração do Auth ---
    USERNAME_FIELD  = "email"       # campo usado como identificador de login
    REQUIRED_FIELDS = ["name"]      # campos pedidos pelo createsuperuser além do email/senha

    objects = CustomUserManager()

    class Meta:
        db_table            = "users"
        verbose_name        = "Usuário"
        verbose_name_plural = "Usuários"
        ordering            = ["name"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"

    # --- Helpers de perfil (evitam comparação de string espalhada no código) ---
    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_produtor(self) -> bool:
        return self.role == self.Role.PRODUTOR


class LoginAudit(models.Model):
    """
    RF-06: Registro de auditoria de cada tentativa de login.

    Registra tanto logins bem-sucedidos quanto falhos, permitindo
    detectar ataques de força bruta e investigar incidentes de segurança.
    """

    user = models.ForeignKey(
        CustomUser,
        verbose_name="Usuário",
        on_delete=models.CASCADE,
        related_name="login_audits",
        null=True,
        blank=True,
        # null=True porque tentativas com e-mail inexistente também
        # devem ser registradas (segurança/auditoria).
    )
    email_attempt = models.EmailField(
        verbose_name="E-mail utilizado",
        db_index=True,
        # Armazena o e-mail digitado mesmo quando o usuário não existe.
        # Essencial para detectar tentativas de enumeração de contas.
    )
    ip_address = models.GenericIPAddressField(
        verbose_name="Endereço IP",
        protocol="both",   # aceita IPv4 e IPv6
        db_index=True,
    )
    user_agent = models.TextField(
        verbose_name="User-Agent",
        blank=True,
        default="",
    )
    success = models.BooleanField(
        verbose_name="Login bem-sucedido",
        default=False,
        db_index=True,
    )
    timestamp = models.DateTimeField(
        verbose_name="Data/Hora",
        default=timezone.now,
        db_index=True,
        editable=False,
    )

    class Meta:
        db_table            = "login_audit"
        verbose_name        = "Auditoria de Login"
        verbose_name_plural = "Auditorias de Login"
        ordering            = ["-timestamp"]
        indexes = [
            # Índice composto para queries de segurança:
            # "todos os logins falhos deste IP nas últimas 24h"
            models.Index(
                fields=["ip_address", "success", "timestamp"],
                name="idx_audit_ip_success_ts",
            ),
            # Índice para relatórios de atividade por usuário
            models.Index(
                fields=["user", "timestamp"],
                name="idx_audit_user_ts",
            ),
        ]

    def __str__(self) -> str:
        status = "✓" if self.success else "✗"
        return f"[{status}] {self.email_attempt} | {self.ip_address} | {self.timestamp:%d/%m/%Y %H:%M}"
