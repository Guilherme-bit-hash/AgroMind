# apps/users/managers.py
# Python 3.12+ | Django 5.x

from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    """
    Manager customizado para o modelo CustomUser, onde o campo de
    identificação único é o e-mail — não o username padrão do Django.
    """

    def create_user(self, email: str, password: str, **extra_fields) -> "CustomUser":
        """
        Cria e salva um usuário com e-mail e senha fornecidos.
        Aplicado em registros comuns via API ou formulário.
        """
        if not email:
            raise ValueError("O campo de e-mail é obrigatório.")

        email = self.normalize_email(email)  # converte domínio para lowercase
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)          # aplica hash via PASSWORD_HASHERS
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields) -> "CustomUser":
        """
        Cria um superusuário via 'manage.py createsuperuser'.
        Garante que is_staff e is_superuser estejam sempre ativos.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMIN")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superusuário precisa ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superusuário precisa ter is_superuser=True.")

        return self.create_user(email, password, **extra_fields)