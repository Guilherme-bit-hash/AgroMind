# apps/properties/web_urls.py
from django.urls import path
from . import web_views

app_name = "web_properties"

urlpatterns = [
    path("", web_views.propriedades_list_view, name="list"),
    path("<int:propriedade_id>/", web_views.propriedade_detail_view, name="detail"),
]
