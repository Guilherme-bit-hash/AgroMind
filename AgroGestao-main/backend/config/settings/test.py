# config/settings/test.py
# Configurações para testes automatizados — usa SQLite em memória.

from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# SQLite em memória para testes rápidos
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# E-mail em console durante testes
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Sessão curta em testes
SESSION_COOKIE_AGE = 3600

# BCrypt mais rápido em testes (menos rounds)
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]
