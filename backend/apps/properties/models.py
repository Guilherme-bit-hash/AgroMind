# apps/properties/models.py
# Python 3.12+ | Django 5.x
# Sprint 02 — Módulo de Propriedades e Talhões

from django.db import models
from django.conf import settings


class UF(models.TextChoices):
    AC = "AC", "Acre"
    AL = "AL", "Alagoas"
    AP = "AP", "Amapá"
    AM = "AM", "Amazonas"
    BA = "BA", "Bahia"
    CE = "CE", "Ceará"
    DF = "DF", "Distrito Federal"
    ES = "ES", "Espírito Santo"
    GO = "GO", "Goiás"
    MA = "MA", "Maranhão"
    MT = "MT", "Mato Grosso"
    MS = "MS", "Mato Grosso do Sul"
    MG = "MG", "Minas Gerais"
    PA = "PA", "Pará"
    PB = "PB", "Paraíba"
    PR = "PR", "Paraná"
    PE = "PE", "Pernambuco"
    PI = "PI", "Piauí"
    RJ = "RJ", "Rio de Janeiro"
    RN = "RN", "Rio Grande do Norte"
    RS = "RS", "Rio Grande do Sul"
    RO = "RO", "Rondônia"
    RR = "RR", "Roraima"
    SC = "SC", "Santa Catarina"
    SP = "SP", "São Paulo"
    SE = "SE", "Sergipe"
    TO = "TO", "Tocantins"


class TipoSolo(models.TextChoices):
    ARGILOSO = "argiloso", "Argiloso"
    ARENOSO  = "arenoso",  "Arenoso"
    SILTOSO  = "siltoso",  "Siltoso"
    HUMIFERO = "humifero", "Humífero"
    CALCARIO = "calcario", "Calcário"
    LATERITA = "laterita", "Laterita"
    MISTO    = "misto",    "Misto"


class Propriedade(models.Model):
    """
    Representa uma fazenda/propriedade rural cadastrada por um usuário.
    As coordenadas (latitude/longitude) alimentam diretamente o módulo climático.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="propriedades",
        verbose_name="Proprietário",
    )
    nome       = models.CharField(max_length=150, verbose_name="Nome da fazenda")
    area_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Área total (ha)")
    municipio  = models.CharField(max_length=100, verbose_name="Município")
    uf         = models.CharField(max_length=2, choices=UF.choices, verbose_name="UF")
    latitude   = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="Latitude")
    longitude  = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="Longitude")
    is_active  = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Propriedade"
        verbose_name_plural = "Propriedades"
        ordering            = ["-created_at"]

    def __str__(self):
        return f"{self.nome} ({self.municipio}/{self.uf})"


class Talhao(models.Model):
    """
    Subdivisão de uma propriedade com características de solo específicas.
    Toda safra será vinculada a um ou mais talhões.
    Inativação preserva o histórico — nunca deve ser deletado se tiver safras.
    """
    propriedade = models.ForeignKey(
        Propriedade,
        on_delete=models.CASCADE,
        related_name="talhoes",
        verbose_name="Propriedade",
    )
    nome      = models.CharField(max_length=100, verbose_name="Nome do talhão")
    area      = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Área (ha)")
    tipo_solo = models.CharField(max_length=20, choices=TipoSolo.choices, verbose_name="Tipo de solo")
    # Coordenadas opcionais no talhão — maior precisão climática (RF-09)
    latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Latitude")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Longitude")
    is_active  = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Talhão"
        verbose_name_plural = "Talhões"
        ordering            = ["nome"]
        constraints = [
            models.UniqueConstraint(
                fields=["propriedade", "nome"],
                condition=models.Q(is_active=True),
                name="unique_talhao_ativo_por_propriedade",
            )
        ]

    def __str__(self):
        return f"{self.nome} — {self.propriedade.nome}"
