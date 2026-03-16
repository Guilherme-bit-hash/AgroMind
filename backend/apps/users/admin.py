# apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, LoginAudit


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Estende o UserAdmin padrão para incluir os campos customizados.
    UserAdmin já fornece: grupos, permissões, histórico, senha com hash.
    """
    model = CustomUser

    list_display  = ("email", "name", "role", "is_active", "created_at")
    list_filter   = ("role", "is_active", "is_staff")
    search_fields = ("email", "name")
    ordering      = ("name",)

    # Campos exibidos na página de EDIÇÃO do usuário
    fieldsets = (
        (None,                   {"fields": ("email", "password")}),
        ("Informações pessoais", {"fields": ("name",)}),
        ("Perfil e Permissões",  {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Datas",                {"fields": ("last_login", "created_at")}),
    )
    readonly_fields = ("created_at", "last_login")

    # Campos exibidos ao CRIAR um novo usuário pelo admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "role", "password1", "password2"),
        }),
    )


@admin.register(LoginAudit)
class LoginAuditAdmin(admin.ModelAdmin):
    list_display    = ("email_attempt", "ip_address", "success", "timestamp")
    list_filter     = ("success",)
    search_fields   = ("email_attempt", "ip_address")
    readonly_fields = ("user", "email_attempt", "ip_address", "user_agent", "success", "timestamp")
    ordering        = ("-timestamp",)

    def has_add_permission(self, request):
        return False  # Auditoria não deve ser criada manualmente pelo admin

    def has_change_permission(self, request, obj=None):
        return False  # Registros de auditoria são imutáveis
