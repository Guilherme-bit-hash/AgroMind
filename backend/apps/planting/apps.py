# apps/planting/apps.py

from django.apps import AppConfig


class PlantingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name               = "apps.planting"
    verbose_name       = "Plantio e Safras"
