# apps/planting/models.py
# Python 3.12+ | Django 5.x
# Model stub da Safra — será expandido no Sprint de Plantio.

from django.conf import settings
from django.db import models


class CulturaSafra(models.TextChoices):
    SOJA    = "soja",    "Soja"
    MILHO   = "milho",   "Milho"
    CAFE    = "cafe",    "Café"
    ALGODAO = "algodao", "Algodão"
    OUTRO   = "outro",   "Outro"


class Safra(models.Model):
    """
    Stub mínimo do model Safra, criado para viabilizar a FK em SaidaEstoque.
    Será expandido com regras de negócio completas no Sprint de Plantio.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="safras",
        verbose_name="Proprietário",
    )
    propriedade = models.ForeignKey(
        "properties.Propriedade",
        on_delete=models.CASCADE,
        related_name="safras",
        verbose_name="Propriedade",
    )
    talhoes = models.ManyToManyField(
        "properties.Talhao",
        blank=True,
        related_name="safras",
        verbose_name="Talhões",
    )

    nome = models.CharField(max_length=120, verbose_name="Nome da safra")
    cultura = models.CharField(
        max_length=20,
        choices=CulturaSafra.choices,
        verbose_name="Cultura",
    )
    data_inicio = models.DateField(verbose_name="Data de início")
    data_fim = models.DateField(
        null=True, blank=True, verbose_name="Data de fim",
    )

    is_active  = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Safra"
        verbose_name_plural = "Safras"
        ordering            = ["-created_at"]

    def __str__(self):
        return f"{self.nome} — {self.propriedade.nome}"
