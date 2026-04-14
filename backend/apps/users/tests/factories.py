# apps/users/tests/factories.py
# Python 3.12+ | Django 5.x
#
# Factories são fábricas de objetos para testes.
# Evitam repetição de código de criação de dados em cada teste.

import factory
from factory.django import DjangoModelFactory

from apps.users.models import CustomUser, LoginAudit


class UserFactory(DjangoModelFactory):
    """
    Fábrica de usuários para testes.
    Gera dados únicos automaticamente via Sequence e Faker.
    """

    class Meta:
        model = CustomUser
        skip_postgeneration_save = True

    name     = factory.Faker("name", locale="pt_BR")
    email    = factory.Sequence(lambda n: f"usuario{n}@teste.com.br")
    password = factory.PostGenerationMethodCall("set_password", "Teste@1234")
    role     = CustomUser.Role.PRODUTOR
    is_active = True

    @classmethod
    def _after_postgeneration(cls, instance, create, results=None):
        """Salva explicitamente após set_password para persistir o hash."""
        if create:
            instance.save()


class AdminFactory(UserFactory):
    """Fábrica de usuários administradores."""
    role     = CustomUser.Role.ADMIN
    is_staff = True


class LoginAuditFactory(DjangoModelFactory):
    """Fábrica de registros de auditoria de login."""

    class Meta:
        model = LoginAudit

    user          = factory.SubFactory(UserFactory)
    email_attempt = factory.LazyAttribute(lambda obj: obj.user.email)
    ip_address    = "127.0.0.1"
    user_agent    = "Mozilla/5.0 (Test)"
    success       = True