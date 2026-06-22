# apps/properties/admin.py
# Python 3.12+ | Django 5.x
# Configuração do Django Admin para Propriedade e Talhão.

from django.contrib import admin
from .models import Propriedade, Talhao


class TalhaoInline(admin.TabularInline):
    model          = Talhao
    extra          = 0
    fields         = ("nome", "area", "tipo_solo", "latitude", "longitude", "is_active")
    readonly_fields = ("created_at",)


@admin.register(Propriedade)
class PropriedadeAdmin(admin.ModelAdmin):
    list_display    = ("nome", "owner", "municipio", "uf", "area_total", "is_active")
    list_filter     = ("uf", "is_active")
    search_fields   = ("nome", "municipio", "owner__email")
    inlines         = [TalhaoInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(Talhao)
class TalhaoAdmin(admin.ModelAdmin):
    list_display    = ("nome", "propriedade", "area", "tipo_solo", "is_active")
    list_filter     = ("tipo_solo", "is_active")
    search_fields   = ("nome", "propriedade__nome")
    readonly_fields = ("created_at", "updated_at")
