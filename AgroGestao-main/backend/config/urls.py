# config/urls.py
# Python 3.11+ | Django 5.x
# URL raiz do projeto — delega cada prefixo para as URLs das apps.

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("usuarios/", include("apps.users.urls", namespace="users")),
]