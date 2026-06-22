# apps/planting/web_urls.py
from django.urls import path
from . import views

app_name = "web_planting"

urlpatterns = [
    path("simulacoes/", views.SimulacaoListView.as_view(), name="simulacao_list"),
    path("simulacoes/nova/", views.SimulacaoCreateView.as_view(), name="simulacao_create"),
    path("simulacoes/<int:pk>/", views.SimulacaoDetailView.as_view(), name="simulacao_detail"),
    path("simulacoes/<int:pk>/excluir/", views.SimulacaoDeleteView.as_view(), name="simulacao_delete"),
    path("simulacoes/excluir-massa/", views.SimulacaoBulkDeleteView.as_view(), name="simulacao_bulk_delete"),
]
