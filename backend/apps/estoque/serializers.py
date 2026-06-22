# apps/estoque/serializers.py
# Python 3.12+ | Django 5.x
# Serializers do módulo de Estoque de Insumos — Sprint 03

from decimal import Decimal
from rest_framework import serializers

from .models import Insumo, EntradaEstoque, SaidaEstoque, TipoInsumo, UnidadeMedida


# ── Insumo ────────────────────────────────────────────────────────────────────

class InsumoSerializer(serializers.ModelSerializer):
    """Serializer de leitura do Insumo."""
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)
    unidade_medida_display = serializers.CharField(
        source="get_unidade_medida_display", read_only=True,
    )
    abaixo_estoque_minimo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Insumo
        fields = [
            "id", "nome", "tipo", "tipo_display",
            "unidade_medida", "unidade_medida_display",
            "fornecedor", "preco_unitario",
            "estoque_minimo", "estoque_atual", "abaixo_estoque_minimo",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "estoque_atual", "is_active", "created_at", "updated_at",
        ]


class InsumoCreateSerializer(serializers.Serializer):
    """Serializer de escrita (POST) — não é ModelSerializer por design."""
    nome = serializers.CharField(max_length=120)
    tipo = serializers.ChoiceField(choices=TipoInsumo.choices)
    unidade_medida = serializers.ChoiceField(choices=UnidadeMedida.choices)
    fornecedor = serializers.CharField(
        max_length=200, required=False, allow_blank=True, default="",
    )
    preco_unitario = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal("0.01"),
    )
    estoque_minimo = serializers.DecimalField(
        max_digits=10, decimal_places=3, min_value=Decimal("0"),
        required=False, default=Decimal("0"),
    )


class InsumoUpdateSerializer(serializers.Serializer):
    """Serializer de escrita (PATCH)."""
    nome = serializers.CharField(max_length=120, required=False)
    tipo = serializers.ChoiceField(choices=TipoInsumo.choices, required=False)
    unidade_medida = serializers.ChoiceField(choices=UnidadeMedida.choices, required=False)
    fornecedor = serializers.CharField(
        max_length=200, required=False, allow_blank=True,
    )
    preco_unitario = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal("0.01"), required=False,
    )
    estoque_minimo = serializers.DecimalField(
        max_digits=10, decimal_places=3, min_value=Decimal("0"), required=False,
    )


# ── EntradaEstoque ───────────────────────────────────────────────────────────

class EntradaEstoqueSerializer(serializers.ModelSerializer):
    """Serializer de leitura da EntradaEstoque."""
    class Meta:
        model = EntradaEstoque
        fields = [
            "id", "insumo", "data", "quantidade",
            "preco_unitario", "custo_total",
            "numero_nota_fiscal", "observacoes",
            "created_by", "created_at",
        ]
        read_only_fields = ["id", "custo_total", "created_by", "created_at"]


class EntradaEstoqueCreateSerializer(serializers.Serializer):
    """Serializer de escrita (POST) para entrada de estoque."""
    data = serializers.DateField()
    quantidade = serializers.DecimalField(
        max_digits=10, decimal_places=3, min_value=Decimal("0.001"),
    )
    preco_unitario = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal("0.01"),
    )
    numero_nota_fiscal = serializers.CharField(
        max_length=100, required=False, allow_blank=True, default="",
    )
    observacoes = serializers.CharField(required=False, allow_blank=True, default="")


# ── SaidaEstoque ─────────────────────────────────────────────────────────────

class SaidaEstoqueSerializer(serializers.ModelSerializer):
    """Serializer de leitura da SaidaEstoque."""
    class Meta:
        model = SaidaEstoque
        fields = [
            "id", "insumo", "talhao", "safra",
            "data", "quantidade",
            "preco_unitario_snapshot", "custo_total",
            "observacoes", "lancado_financeiro",
            "created_by", "created_at",
        ]
        read_only_fields = [
            "id", "preco_unitario_snapshot", "custo_total",
            "lancado_financeiro", "created_by", "created_at",
        ]


class SaidaEstoqueCreateSerializer(serializers.Serializer):
    """Serializer de escrita (POST) para saída de estoque."""
    talhao_id = serializers.IntegerField()
    safra_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    data = serializers.DateField()
    quantidade = serializers.DecimalField(
        max_digits=10, decimal_places=3, min_value=Decimal("0.001"),
    )
    observacoes = serializers.CharField(required=False, allow_blank=True, default="")
