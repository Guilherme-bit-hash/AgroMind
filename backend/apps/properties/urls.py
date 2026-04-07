# apps/properties/urls.py
# Python 3.12+ | Django 5.x
# Rotas do módulo de Propriedades e Talhões.

from django.urls import path
from . import views

app_name = "properties"

urlpatterns = [
    # Propriedades
    path("",                          views.PropriedadeListCreateView.as_view(), name="propriedade-list-create"),
    path("<int:propriedade_id>/",     views.PropriedadeDetailView.as_view(),     name="propriedade-detail"),

    # Talhões aninhados à propriedade
    path("<int:propriedade_id>/talhoes/", views.TalhaoListCreateView.as_view(), name="talhao-list-create"),

    # Talhão individual por ID global
    path("talhoes/<int:talhao_id>/",  views.TalhaoDetailView.as_view(),         name="talhao-detail"),
]
