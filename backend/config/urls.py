# config/urls.py
# Python 3.12+ | Django 5.x
# URL raiz do projeto — delega cada prefixo para as URLs das apps.

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Páginas Web (Frontend)
    path("usuarios/", include("apps.users.urls", namespace="users")),
    path("propriedades/", include("apps.properties.web_urls", namespace="web_properties")),

    # APIs REST (Sprint 02)
    path("api/propriedades/", include("apps.properties.urls", namespace="properties")),

    # JWT Token endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]