# apps/estoque/urls.py
# Python 3.12+ | Django 5.x
# URLs do módulo de Estoque de Insumos — Sprint 03
# Prefixo esperado: /api/v1/propriedades/<propriedade_id>/insumos/

from django.urls import path
from . import views

app_name = "estoque"

urlpatterns = [
    # Insumos CRUD
    path(
        "",
        views.InsumoListCreateView.as_view(),
        name="insumo-list-create",
    ),
    path(
        "<int:insumo_id>/",
        views.InsumoDetailView.as_view(),
        name="insumo-detail",
    ),

    # Entradas de estoque (RF-40, RF-43)
    path(
        "<int:insumo_id>/entradas/",
        views.EntradaEstoqueListCreateView.as_view(),
        name="entrada-list-create",
    ),

    # Saídas de estoque (RF-41, RF-42, RF-43, RF-44)
    path(
        "<int:insumo_id>/saidas/",
        views.SaidaEstoqueListCreateView.as_view(),
        name="saida-list-create",
    ),

    # Alertas de estoque mínimo (RF-42)
    path(
        "alertas/",
        views.AlertaEstoqueView.as_view(),
        name="alertas",
    ),
]
