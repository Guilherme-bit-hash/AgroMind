# config/settings/base.py
# Configurações compartilhadas por TODOS os ambientes.
# Nunca execute com este settings diretamente — use development.py ou production.py.

import environ
from pathlib import Path

# ---------------------------------------------------------------------------
# Caminhos base
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
# BASE_DIR aponta para AgroGestao/backend/

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
)

# Carrega o arquivo .env a partir da raiz do backend
environ.Env.read_env(BASE_DIR / ".env")

# ---------------------------------------------------------------------------
# Segurança
# ---------------------------------------------------------------------------
SECRET_KEY    = env("DJANGO_SECRET_KEY")
DEBUG         = env("DEBUG")
ALLOWED_HOSTS = env("ALLOWED_HOSTS")

# ---------------------------------------------------------------------------
# Aplicações instaladas
# ---------------------------------------------------------------------------
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
]

SITE_ID = 1

THIRD_PARTY_APPS: list[str] = []

LOCAL_APPS = [
    "apps.users",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ---------------------------------------------------------------------------
# RF-05 | Segurança de senhas — BCrypt como hasher principal
# ---------------------------------------------------------------------------
PASSWORD_HASHERS = [
    # Posição 0 = hasher PADRÃO para novas senhas
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",

    # Hashers legados abaixo: usados APENAS para verificar senhas antigas
    # (usuários migrados de outro sistema). Django faz upgrade automático
    # para BCrypt no próximo login do usuário.
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
]
# Por que BCryptSHA256 e não BCrypt puro?
# O BCrypt tem limite de 72 bytes na entrada. O SHA256PasswordHasher faz um
# pré-hash da senha antes de passar ao BCrypt, eliminando esse limite.

# ---------------------------------------------------------------------------
# Banco de Dados — MySQL
# ---------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE":   "django.db.backends.mysql",
        "NAME":     env("DB_NAME"),
        "USER":     env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST":     env("DB_HOST", default="127.0.0.1"),
        "PORT":     env("DB_PORT", default="3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            # utf8mb4 é o charset correto para MySQL — o "utf8" do MySQL
            # é, na verdade, um utf8 incompleto (sem suporte a emojis e
            # caracteres fora do BMP). utf8mb4 é o Unicode completo real.
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            # STRICT_TRANS_TABLES impede que o MySQL aceite silenciosamente
            # dados inválidos — falha ruidosamente em vez de truncar ou converter.
        },
        "CONN_MAX_AGE": 60,
        # Reutiliza conexões por até 60 segundos — reduz overhead de
        # reconexão em cenários de alta requisição.
    }
}

# ---------------------------------------------------------------------------
# RF-02 | Sessões e Segurança de Autenticação
# ---------------------------------------------------------------------------
AUTH_USER_MODEL = "users.CustomUser"

SESSION_ENGINE = "django.contrib.sessions.backends.db"
# Sessões armazenadas no banco — permite invalidação server-side.

SESSION_COOKIE_AGE = env.int("SESSION_COOKIE_AGE", default=28800)
# Padrão: 8 horas (28800 segundos). Configurável via .env.

SESSION_EXPIRE_AT_BROWSER_CLOSE = env.bool(
    "SESSION_EXPIRE_AT_BROWSER_CLOSE", default=False
)

SESSION_COOKIE_HTTPONLY = True
# Impede que JavaScript acesse o cookie de sessão — mitiga XSS.

SESSION_COOKIE_SAMESITE = "Lax"
# Proteção contra CSRF em requisições cross-site.

# ---------------------------------------------------------------------------
# Validação de senha (RF-05 — complementar ao bcrypt)
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------------------
# Internacionalização
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "pt-br"
TIME_ZONE     = "America/Sao_Paulo"
USE_I18N      = True
USE_TZ        = True
# USE_TZ=True é OBRIGATÓRIO. Django armazena tudo em UTC internamente
# e converte para TIME_ZONE na exibição — evita bugs de horário de verão.

# ---------------------------------------------------------------------------
# Arquivos estáticos
# ---------------------------------------------------------------------------
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# RF-03 | E-mail (configurado por ambiente)
# ---------------------------------------------------------------------------
DEFAULT_FROM_EMAIL     = env("DEFAULT_FROM_EMAIL", default="noreply@agrogestao.com.br")
PASSWORD_RESET_TIMEOUT = 3600  # Link de reset expira em 1 hora
