from django.urls import path
from . import views

app_name = "properties"

urlpatterns = [
    # Propriedades
    path("", views.PropriedadeListCreateView.as_view(), name="propriedade-list-create"),
    path("<int:propriedade_id>/", views.PropriedadeDetailView.as_view(), name="propriedade-detail"),
    path("<int:propriedade_id>/toggle-status/", views.PropriedadeToggleStatusView.as_view(), name="propriedade-toggle-status"),

    # Talhões aninhados à propriedade
    path("<int:propriedade_id>/talhoes/", views.TalhaoListCreateView.as_view(), name="talhao-list-create"),

    # Talhão individual por ID global
    path("talhoes/<int:talhao_id>/", views.TalhaoDetailView.as_view(), name="talhao-detail"),
    path("talhoes/<int:talhao_id>/toggle-status/", views.TalhaoToggleStatusView.as_view(), name="talhao-toggle-status"),
]