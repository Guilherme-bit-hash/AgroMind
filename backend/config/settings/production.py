# config/settings/production.py
# Configurações de produção. Segurança reforçada.

from .base import *  # noqa: F401, F403

DEBUG = False

# ---------------------------------------------------------------------------
# HTTPS e Segurança de Cookies
# ---------------------------------------------------------------------------
SECURE_SSL_REDIRECT            = True
SECURE_HSTS_SECONDS            = 31536000  # 1 ano de HSTS
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD            = True
SESSION_COOKIE_SECURE          = True   # Cookie de sessão apenas via HTTPS
CSRF_COOKIE_SECURE             = True   # Cookie CSRF apenas via HTTPS
SECURE_CONTENT_TYPE_NOSNIFF    = True
X_FRAME_OPTIONS                = "DENY"

# ---------------------------------------------------------------------------
# E-mail via SMTP em produção
# ---------------------------------------------------------------------------
EMAIL_BACKEND       = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST          = env("EMAIL_HOST")           # noqa: F405
EMAIL_PORT          = env.int("EMAIL_PORT", default=587)  # noqa: F405
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = env("EMAIL_HOST_USER")      # noqa: F405
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")  # noqa: F405
