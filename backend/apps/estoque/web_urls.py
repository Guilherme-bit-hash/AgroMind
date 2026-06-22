# apps/estoque/web_urls.py
from django.urls import path
from . import web_views

app_name = "web_estoque"

urlpatterns = [
    path("", web_views.estoque_select_view, name="select"),
    path("<int:propriedade_id>/", web_views.estoque_dashboard_view, name="dashboard"),
]
