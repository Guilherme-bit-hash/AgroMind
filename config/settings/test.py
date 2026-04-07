# config/settings/test.py
# Configurações para testes automatizados — usa SQLite em memória.

import os

# Variáveis de ambiente obrigatórias para o base.py — definidas
# ANTES do import para que os testes não dependam de um arquivo .env.
os.environ.setdefault("DJANGO_SECRET_KEY", "test-secret-key-insecure-only-for-tests")
os.environ.setdefault("DEBUG", "True")
os.environ.setdefault("ALLOWED_HOSTS", "localhost,127.0.0.1")
os.environ.setdefault("DB_NAME", "test_db")
os.environ.setdefault("DB_USER", "test_user")
os.environ.setdefault("DB_PASSWORD", "test_pass")
os.environ.setdefault("DB_HOST", "127.0.0.1")
os.environ.setdefault("DB_PORT", "3306")

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
