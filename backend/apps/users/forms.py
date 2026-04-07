# apps/users/forms.py
# Python | Django

from django import forms
from django.contrib.auth.password_validation import validate_password

from .models import CustomUser


class RegisterForm(forms.Form):
    """Formulário de cadastro — RF-01."""

    name = forms.CharField(
        label      = "Nome completo",
        max_length = 150,
        widget     = forms.TextInput(attrs={"placeholder": "Seu nome completo"}),
    )
    email = forms.EmailField(
        label  = "E-mail",
        widget = forms.EmailInput(attrs={"placeholder": "seu@email.com"}),
    )
    password1 = forms.CharField(
        label  = "Senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Mínimo 8 caracteres"}),
    )
    password2 = forms.CharField(
        label  = "Confirme a senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Repita a senha"}),
    )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError("Este e-mail já está cadastrado.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get("password1")
        p2 = cleaned_data.get("password2")

        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("As senhas não conferem.")

        if p1:
            validate_password(p1)  # aplica os validadores do AUTH_PASSWORD_VALIDATORS

        return cleaned_data


class LoginForm(forms.Form):
    """Formulário de login — RF-02."""

    email = forms.EmailField(
        label  = "E-mail",
        widget = forms.EmailInput(attrs={"placeholder": "seu@email.com"}),
    )
    password = forms.CharField(
        label  = "Senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Sua senha"}),
    )


class PasswordResetRequestForm(forms.Form):
    """Formulário para solicitar redefinição de senha — RF-03."""

    email = forms.EmailField(
        label  = "E-mail cadastrado",
        widget = forms.EmailInput(attrs={"placeholder": "seu@email.com"}),
    )


class PasswordResetConfirmForm(forms.Form):
    """Formulário para definir a nova senha — RF-03."""

    def __init__(self, *args, **kwargs):
        # Remove kwargs extras que a view passa mas o Form não espera
        kwargs.pop("uidb64", None)
        kwargs.pop("token", None)
        super().__init__(*args, **kwargs)

    new_password1 = forms.CharField(
        label  = "Nova senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Mínimo 8 caracteres"}),
    )
    new_password2 = forms.CharField(
        label  = "Confirme a nova senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Repita a nova senha"}),
    )

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get("new_password1")
        p2 = cleaned_data.get("new_password2")

        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("As senhas não conferem.")

        if p1:
            validate_password(p1)

        return cleaned_data


class AdminUserCreateForm(forms.Form):
    """
    Formulário de criação de usuário pelo Administrador.
    Diferente do RegisterForm público, este permite definir o role
    e não exige que o admin confirme a senha duas vezes.
    """

    name = forms.CharField(
        label      = "Nome completo",
        max_length = 150,
        widget     = forms.TextInput(attrs={"placeholder": "Nome completo"}),
    )
    email = forms.EmailField(
        label  = "E-mail",
        widget = forms.EmailInput(attrs={"placeholder": "email@dominio.com"}),
    )
    role = forms.ChoiceField(
        label   = "Perfil",
        choices = CustomUser.Role.choices,
    )
    password1 = forms.CharField(
        label  = "Senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Mínimo 8 caracteres"}),
    )
    password2 = forms.CharField(
        label  = "Confirme a senha",
        widget = forms.PasswordInput(attrs={"placeholder": "Repita a senha"}),
    )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError("Este e-mail já está cadastrado.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get("password1")
        p2 = cleaned_data.get("password2")

        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("As senhas não conferem.")

        if p1:
            validate_password(p1)

        return cleaned_data