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


class NivelTecnologico(models.TextChoices):
    BAIXO = "baixo", "Baixo"
    MEDIO = "medio", "Médio"
    ALTO = "alto", "Alto"

class SimulacaoSafra(models.Model):
    """
    Model para salvar simulações de plantio (RF-09 a RF-15).
    Permite projeção de custos, receitas e ponto de equilíbrio.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="simulacoes",
        verbose_name="Proprietário",
    )
    nome = models.CharField(max_length=120, verbose_name="Nome da Simulação")
    cultura = models.CharField(
        max_length=20,
        choices=CulturaSafra.choices,
        verbose_name="Cultura",
    )
    area_hectares = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Área (ha)"
    )
    nivel_tecnologico = models.CharField(
        max_length=10,
        choices=NivelTecnologico.choices,
        verbose_name="Nível Tecnológico"
    )
    preco_saca_esperado = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Preço da Saca (R$)"
    )

    # Resultados calculados da simulação
    custo_sementes = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    custo_fertilizantes = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    custo_defensivos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    produtividade_esperada = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Produtividade Esperada (sc/ha)", default=0
    )
    custo_total_estimado = models.DecimalField(
        max_digits=15, decimal_places=2, verbose_name="Custo Total Estimado (R$)", default=0
    )
    receita_projetada = models.DecimalField(
        max_digits=15, decimal_places=2, verbose_name="Receita Projetada (R$)", default=0
    )
    margem_lucro = models.DecimalField(
        max_digits=5, decimal_places=2, verbose_name="Margem de Lucro (%)", default=0
    )
    ponto_equilibrio = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Ponto de Equilíbrio (sc)", default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Simulação de Safra"
        verbose_name_plural = "Simulações de Safra"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Simulação: {self.nome} ({self.get_cultura_display()})"
