# config/settings/development.py
# Ambiente local de desenvolvimento. NUNCA use em produção.

from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Em desenvolvimento, config para testes reais de SMTP (Gmail)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

# django-extensions: shell_plus, graph_models, etc.
INSTALLED_APPS += ["django_extensions"]  # noqa: F405

# Sessão mais curta em dev para facilitar testes de expiração
SESSION_COOKIE_AGE = 3600  # 1 hora em desenvolvimento

# Sobrescreve o banco de dados para usar SQLite em desenvolvimento local 
# (evita o erro do MySQL "Access denied" / sem necessidade de instalar servidor MySQL)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
