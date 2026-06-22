# apps/estoque/models.py
# Python 3.12+ | Django 5.x
# Models do módulo de Estoque de Insumos — Sprint 03

from django.conf import settings
from django.db import models


# ── Choices ───────────────────────────────────────────────────────────────────

class TipoInsumo(models.TextChoices):
    SEMENTE     = "semente",     "Semente"
    FERTILIZANTE = "fertilizante", "Fertilizante"
    DEFENSIVO   = "defensivo",   "Defensivo"
    OUTRO       = "outro",       "Outro"


class UnidadeMedida(models.TextChoices):
    KG = "kg", "Quilograma (kg)"
    G  = "g",  "Grama (g)"
    L  = "l",  "Litro (L)"
    ML = "ml", "Mililitro (mL)"
    SC = "sc", "Saca (sc)"
    T  = "t",  "Tonelada (t)"
    UN = "un", "Unidade (un)"


# ── Insumo (RF-39) ───────────────────────────────────────────────────────────

class Insumo(models.Model):
    """
    Cadastro de insumos agrícolas vinculados a uma propriedade.
    O campo `estoque_atual` é mantido via service (registrar_entrada / registrar_saida),
    nunca diretamente pelo usuário.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="insumos",
        verbose_name="Proprietário",
    )
    propriedade = models.ForeignKey(
        "properties.Propriedade",
        on_delete=models.CASCADE,
        related_name="insumos",
        verbose_name="Propriedade",
    )

    nome = models.CharField(max_length=120, verbose_name="Nome do insumo")
    tipo = models.CharField(
        max_length=20,
        choices=TipoInsumo.choices,
        verbose_name="Tipo",
    )
    unidade_medida = models.CharField(
        max_length=5,
        choices=UnidadeMedida.choices,
        verbose_name="Unidade de medida",
    )
    fornecedor = models.CharField(
        max_length=200, blank=True, default="",
        verbose_name="Fornecedor",
    )
    preco_unitario = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name="Preço unitário (R$)",
    )
    estoque_minimo = models.DecimalField(
        max_digits=10, decimal_places=3, default=0,
        verbose_name="Estoque mínimo",
    )
    estoque_atual = models.DecimalField(
        max_digits=10, decimal_places=3, default=0,
        verbose_name="Estoque atual",
    )

    is_active  = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Insumo"
        verbose_name_plural = "Insumos"
        ordering            = ["nome"]
        constraints = [
            models.UniqueConstraint(
                fields=["propriedade", "nome"],
                condition=models.Q(is_active=True),
                name="unique_insumo_ativo_por_propriedade",
            )
        ]

    def __str__(self):
        return f"{self.nome} ({self.get_unidade_medida_display()})"

    @property
    def abaixo_estoque_minimo(self) -> bool:
        """RF-42: Retorna True se o estoque atual está igual ou abaixo do mínimo."""
        return self.estoque_atual <= self.estoque_minimo


# ── EntradaEstoque (RF-40) ───────────────────────────────────────────────────

class EntradaEstoque(models.Model):
    """
    Registro de entrada de estoque (compra de insumos).
    O campo custo_total é calculado no service: quantidade * preco_unitario.
    """

    insumo = models.ForeignKey(
        Insumo,
        on_delete=models.CASCADE,
        related_name="entradas",
        verbose_name="Insumo",
    )
    data = models.DateField(verbose_name="Data da entrada")
    quantidade = models.DecimalField(
        max_digits=10, decimal_places=3,
        verbose_name="Quantidade",
    )
    preco_unitario = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name="Preço unitário (R$)",
    )
    custo_total = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name="Custo total (R$)",
    )
    numero_nota_fiscal = models.CharField(
        max_length=100, blank=True, default="",
        verbose_name="Nº da nota fiscal",
    )
    observacoes = models.TextField(
        blank=True, default="",
        verbose_name="Observações",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="entradas_estoque",
        verbose_name="Criado por",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Entrada de Estoque"
        verbose_name_plural = "Entradas de Estoque"
        ordering            = ["-data", "-created_at"]

    def __str__(self):
        return f"Entrada: {self.quantidade} {self.insumo.get_unidade_medida_display()} de {self.insumo.nome}"


# ── SaidaEstoque (RF-41, RF-44) ──────────────────────────────────────────────

class SaidaEstoque(models.Model):
    """
    Registro de saída de estoque (aplicação de insumos no talhão).
    O preco_unitario_snapshot captura o preço do insumo no momento da saída.
    O campo lancado_financeiro é a flag RF-44 (integração futura com FinanceiroService).
    """

    insumo = models.ForeignKey(
        Insumo,
        on_delete=models.CASCADE,
        related_name="saidas",
        verbose_name="Insumo",
    )
    talhao = models.ForeignKey(
        "properties.Talhao",
        on_delete=models.CASCADE,
        related_name="saidas_estoque",
        verbose_name="Talhão",
    )
    safra = models.ForeignKey(
        "planting.Safra",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="saidas_estoque",
        verbose_name="Safra",
    )

    data = models.DateField(verbose_name="Data da saída")
    quantidade = models.DecimalField(
        max_digits=10, decimal_places=3,
        verbose_name="Quantidade",
    )
    preco_unitario_snapshot = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name="Preço unitário no momento (R$)",
    )
    custo_total = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name="Custo total (R$)",
    )
    observacoes = models.TextField(
        blank=True, default="",
        verbose_name="Observações",
    )
    lancado_financeiro = models.BooleanField(
        default=False,
        verbose_name="Lançado no financeiro",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saidas_estoque",
        verbose_name="Criado por",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Saída de Estoque"
        verbose_name_plural = "Saídas de Estoque"
        ordering            = ["-data", "-created_at"]

    def __str__(self):
        return f"Saída: {self.quantidade} {self.insumo.get_unidade_medida_display()} de {self.insumo.nome}"
