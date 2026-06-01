# apps/weather/web_urls.py
from django.urls import path
from . import web_views

app_name = "web_weather"

urlpatterns = [
    path("", web_views.weather_dashboard_view, name="dashboard"),
]
