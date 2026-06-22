# apps/users/tests/test_services.py
import pytest
from django.core import mail
from django.core.exceptions import ValidationError
from django.http import HttpRequest
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from apps.users.services import request_password_reset, confirm_password_reset
from .factories import UserFactory


@pytest.fixture
def mock_request():
    """Mock básico de HttpRequest para evitar necessidade de usar Client."""
    request = HttpRequest()
    request.META['HTTP_HOST'] = '127.0.0.1:8000'
    return request


class TestPasswordResetServices:

    def test_request_password_reset_envia_email(self, db, mock_request):
        """Service deve gerar token e enviar e-mail se a conta existir."""
        user = UserFactory()
        
        # Limpa o outbox antes do teste
        mail.outbox = []

        request_password_reset(mock_request, email=user.email)

        assert len(mail.outbox) == 1
        sent_email = mail.outbox[0]
        
        assert sent_email.subject == "AgroGestão — Redefinição de senha"
        assert user.email in sent_email.to
        assert "example.com/usuarios/senha/redefinir/" in sent_email.body

    def test_request_password_reset_ignora_email_inexistente(self, db, mock_request):
        """
        Anti-enumeração: tentar recuperar conta que não existe não deve falhar
        e tampouco enviar e-mail.
        """
        mail.outbox = []

        # Não levanta exceção e passa em silêncio
        request_password_reset(mock_request, email="naoexiste@fake.com")

        assert len(mail.outbox) == 0

    def test_confirm_password_reset_altera_senha_com_token_valido(self, db):
        """Se o token for válido, a senha deve ser alterada com BCrypt."""
        user = UserFactory(password="SenhaAntiga123")
        old_password_hash = user.password

        # Gera token manulamente
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        updated_user = confirm_password_reset(
            uidb64=uidb64,
            token=token,
            new_password="NovaSenhaTop@2026"
        )

        assert updated_user.pk == user.pk
        assert updated_user.password != old_password_hash
        assert updated_user.check_password("NovaSenhaTop@2026") is True

    def test_confirm_password_reset_falha_com_token_invalido(self, db):
        """Token adulterado ou expirado deve gerar ValidationError."""
        user = UserFactory(password="SenhaAntiga123")
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        with pytest.raises(ValidationError, match="invalido|inválido"):
            confirm_password_reset(
                uidb64=uidb64,
                token="token-falso-123",
                new_password="NovaSenhaTop@2026"
            )

    def test_confirm_password_reset_falha_com_uid_invalido(self, db):
        """UIDB64 corrompido ou apontando para user inexistente deve falhar."""
        user = UserFactory()
        token = default_token_generator.make_token(user)
        
        with pytest.raises(ValidationError, match="invalido|inválido"):
            confirm_password_reset(
                uidb64="uid-corrompido",
                token=token,
                new_password="NovaSenhaTop@2026"
            )
