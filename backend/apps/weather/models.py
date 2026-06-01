from django.db import models
from apps.properties.models import Talhao

class WeatherHistory(models.Model):
    plot = models.ForeignKey(Talhao, on_delete=models.CASCADE, related_name="historico_clima_app", verbose_name="Talhão")
    consulted_at = models.DateTimeField(auto_now_add=True, verbose_name="Data da consulta")
    classification_summary = models.JSONField(verbose_name="Resumo da classificação (10 dias)")

    class Meta:
        verbose_name = "Histórico Meteorológico"
        verbose_name_plural = "Históricos Meteorológicos"
        ordering = ["-consulted_at"]

    def __str__(self):
        return f"Consulta {self.plot.nome} em {self.consulted_at.strftime('%d/%m/%Y %H:%M')}"
