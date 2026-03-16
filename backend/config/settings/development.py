# config/settings/development.py
# Ambiente local de desenvolvimento. NUNCA use em produção.

from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Em desenvolvimento, e-mails são impressos no terminal — sem servidor SMTP real.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# django-extensions: shell_plus, graph_models, etc.
INSTALLED_APPS += ["django_extensions"]  # noqa: F405

# Sessão mais curta em dev para facilitar testes de expiração
SESSION_COOKIE_AGE = 3600  # 1 hora em desenvolvimento
