from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def home(request):
    return redirect('users:dashboard')

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),

    path("usuarios/", include("apps.users.urls", namespace="users")),
    path("propriedades/", include("apps.properties.web_urls", namespace="web_properties")),

    path("api/propriedades/", include("apps.properties.urls", namespace="properties")),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]