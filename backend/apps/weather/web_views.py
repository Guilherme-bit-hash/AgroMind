# apps/weather/web_views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def weather_dashboard_view(request):
    """Renderiza a página web do módulo Clima (Frontend)."""
    return render(request, "weather/weather_dashboard.html", {"user": request.user})
