# apps/estoque/selectors.py
# Python 3.12+ | Django 5.x
# Selectors (leitura) do módulo de Estoque de Insumos — Sprint 03

from django.db.models import QuerySet

from .models import Insumo, EntradaEstoque, SaidaEstoque


# ── Insumo ────────────────────────────────────────────────────────────────────

def get_insumos_by_propriedade(*, owner, propriedade_id: int) -> QuerySet[Insumo]:
    """Lista todos os insumos ativos de uma propriedade do owner."""
    return Insumo.objects.filter(
        owner=owner,
        propriedade_id=propriedade_id,
        propriedade__is_active=True,
        is_active=True,
    )


def get_insumo_by_id(*, owner, insumo_id: int) -> Insumo:
    """Busca um insumo ativo pelo ID, validando ownership."""
    return Insumo.objects.get(
        id=insumo_id,
        owner=owner,
        is_active=True,
    )


def get_insumos_abaixo_estoque_minimo(*, owner, propriedade_id: int) -> QuerySet[Insumo]:
    """RF-42: Lista insumos ativos cuja estoque_atual <= estoque_minimo."""
    from django.db.models import F

    return Insumo.objects.filter(
        owner=owner,
        propriedade_id=propriedade_id,
        propriedade__is_active=True,
        is_active=True,
        estoque_atual__lte=F("estoque_minimo"),
    )


# ── EntradaEstoque ───────────────────────────────────────────────────────────

def get_entradas_by_insumo(*, insumo: Insumo) -> QuerySet[EntradaEstoque]:
    """RF-43: Histórico de entradas de um insumo, ordenado por data desc."""
    return EntradaEstoque.objects.filter(insumo=insumo).order_by("-data", "-created_at")


# ── SaidaEstoque ─────────────────────────────────────────────────────────────

def get_saidas_by_insumo(*, insumo: Insumo) -> QuerySet[SaidaEstoque]:
    """RF-43: Histórico de saídas de um insumo, ordenado por data desc."""
    return SaidaEstoque.objects.filter(insumo=insumo).order_by("-data", "-created_at")
