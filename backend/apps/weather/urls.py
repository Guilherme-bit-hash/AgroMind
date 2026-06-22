from django.urls import path
from . import views

app_name = "weather"

urlpatterns = [
    path("plot/<int:talhao_id>/", views.WeatherForecastView.as_view(), name="weather-forecast"),
]
