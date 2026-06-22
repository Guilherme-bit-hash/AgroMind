# apps/planting/admin.py
# Python 3.12+ | Django 5.x

from django.contrib import admin
from .models import Safra


@admin.register(Safra)
class SafraAdmin(admin.ModelAdmin):
    list_display    = ("nome", "cultura", "propriedade", "data_inicio", "data_fim", "is_active")
    list_filter     = ("cultura", "is_active")
    search_fields   = ("nome", "propriedade__nome")
    readonly_fields = ("created_at", "updated_at")
