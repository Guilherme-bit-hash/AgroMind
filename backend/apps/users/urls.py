# apps/users/urls.py
# Python 3.12+ | Django 5.x

from django.urls import path
from . import views

app_name = "users"

urlpatterns = [

    # --- Autenticação (RF-01, RF-02, RF-03) ---
    path("cadastro/",         views.register_view,               name="register"),
    path("login/",            views.login_view,                  name="login"),
    path("logout/",           views.logout_view,                 name="logout"),
    path("dashboard/",        views.dashboard_view,              name="dashboard"),

    path("senha/recuperar/",  views.password_reset_request_view, name="password_reset_request"),
    path("senha/redefinir/<str:uidb64>/<str:token>/",
                              views.password_reset_confirm_view, name="password_reset_confirm"),
    path("senha/redefinida/", views.password_reset_done_view,    name="password_reset_done"),

    # --- CRUD de Usuários (Admin) ---
    path("admin/usuarios/",         views.user_list_view,   name="user_list"),
    path("admin/usuarios/novo/",    views.user_create_view, name="user_create"),
]