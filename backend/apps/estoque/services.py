# apps/estoque/services.py
# Python 3.12+ | Django 5.x
# Services (escrita/lógica de negócio) do módulo de Estoque de Insumos — Sprint 03

import logging
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import F

from apps.properties.selectors import get_propriedade_by_id, get_talhao_by_id

from . import selectors
from .models import Insumo, EntradaEstoque, SaidaEstoque

logger = logging.getLogger(__name__)


# ── Insumo (RF-39) ───────────────────────────────────────────────────────────

def create_insumo(
    *,
    owner,
    propriedade_id: int,
    nome: str,
    tipo: str,
    unidade_medida: str,
    preco_unitario: Decimal,
    fornecedor: str = "",
    estoque_minimo: Decimal = Decimal("0"),
) -> Insumo:
    """Cadastra um novo insumo vinculado a uma propriedade do owner."""
    propriedade = get_propriedade_by_id(propriedade_id=propriedade_id, user=owner)

    insumo = Insumo(
        owner=owner,
        propriedade=propriedade,
        nome=nome,
        tipo=tipo,
        unidade_medida=unidade_medida,
        fornecedor=fornecedor,
        preco_unitario=preco_unitario,
        estoque_minimo=estoque_minimo,
    )
    insumo.full_clean()
    insumo.save()
    return insumo


def update_insumo(*, insumo: Insumo, **fields) -> Insumo:
    """Atualiza campos permitidos de um insumo."""
    allowed = {
        "nome", "tipo", "unidade_medida", "fornecedor",
        "preco_unitario", "estoque_minimo",
    }
    for field, value in fields.items():
        if field not in allowed:
            raise ValidationError(f"Campo '{field}' não pode ser atualizado aqui.")
        setattr(insumo, field, value)
    insumo.full_clean()
    insumo.save(update_fields=list(fields.keys()) + ["updated_at"])
    return insumo


def deactivate_insumo(*, insumo: Insumo) -> Insumo:
    """Soft delete: inativa o insumo preservando todo o histórico."""
    insumo.is_active = False
    insumo.save(update_fields=["is_active", "updated_at"])
    return insumo


# ── EntradaEstoque (RF-40) ───────────────────────────────────────────────────

def registrar_entrada(
    *,
    owner,
    insumo_id: int,
    data,
    quantidade: Decimal,
    preco_unitario: Decimal,
    numero_nota_fiscal: str = "",
    observacoes: str = "",
) -> EntradaEstoque:
    """
    Registra uma entrada de estoque (compra).

    1. Busca insumo via selector (valida owner)
    2. Valida quantidade > 0
    3. Calcula custo_total = quantidade * preco_unitario
    4. Cria EntradaEstoque
    5. Atualiza estoque_atual com F() + quantidade (atômico)
    """
    insumo = selectors.get_insumo_by_id(owner=owner, insumo_id=insumo_id)

    if quantidade <= 0:
        raise ValidationError("A quantidade deve ser maior que zero.")

    custo_total = quantidade * preco_unitario

    entrada = EntradaEstoque.objects.create(
        insumo=insumo,
        data=data,
        quantidade=quantidade,
        preco_unitario=preco_unitario,
        custo_total=custo_total,
        numero_nota_fiscal=numero_nota_fiscal,
        observacoes=observacoes,
        created_by=owner,
    )

    # Atualização atômica do saldo
    Insumo.objects.filter(pk=insumo.pk).update(
        estoque_atual=F("estoque_atual") + quantidade
    )

    return entrada


# ── SaidaEstoque (RF-41, RF-42, RF-44) ──────────────────────────────────────

def registrar_saida(
    *,
    owner,
    insumo_id: int,
    talhao_id: int,
    data,
    quantidade: Decimal,
    safra_id: int | None = None,
    observacoes: str = "",
) -> SaidaEstoque:
    """
    Registra uma saída de estoque (aplicação no talhão).

    1. Busca insumo via selector (valida owner)
    2. Busca talhão via selector (valida owner)
    3. Valida quantidade > 0
    4. Valida estoque suficiente (estoque_atual >= quantidade)
    5. Cria SaidaEstoque com snapshot de preço
    6. Atualiza estoque_atual com F() - quantidade (atômico)
    7. Lança custo no financeiro (stub RF-44)
    8. Verifica alerta de estoque mínimo (RF-42)
    """
    insumo = selectors.get_insumo_by_id(owner=owner, insumo_id=insumo_id)
    talhao = get_talhao_by_id(talhao_id=talhao_id, user=owner)

    if quantidade <= 0:
        raise ValidationError("A quantidade deve ser maior que zero.")

    if insumo.estoque_atual < quantidade:
        raise ValidationError(
            f"Estoque insuficiente. Disponível: {insumo.estoque_atual} "
            f"{insumo.get_unidade_medida_display()}, solicitado: {quantidade}."
        )

    custo_total = quantidade * insumo.preco_unitario

    saida = SaidaEstoque.objects.create(
        insumo=insumo,
        talhao=talhao,
        safra_id=safra_id,
        data=data,
        quantidade=quantidade,
        preco_unitario_snapshot=insumo.preco_unitario,
        custo_total=custo_total,
        observacoes=observacoes,
        created_by=owner,
    )

    # Atualização atômica do saldo
    Insumo.objects.filter(pk=insumo.pk).update(
        estoque_atual=F("estoque_atual") - quantidade
    )

    # RF-44: Lançar custo no financeiro
    _lancar_custo_financeiro(saida)
    saida.refresh_from_db()

    # RF-42: Verificar alerta de estoque mínimo após atualização
    insumo.refresh_from_db()
    if insumo.abaixo_estoque_minimo:
        _emitir_alerta_estoque_minimo(insumo)

    return saida


def _lancar_custo_financeiro(saida: SaidaEstoque) -> None:
    """
    RF-44: Lança o custo da saída no módulo financeiro da safra.

    TODO: Integração futura com FinanceiroService
    -------------------------------------------------
    Quando o módulo financeiro for implementado, esta função deverá:
    1. Buscar ou criar o registro financeiro da safra vinculada à saída
    2. Criar um LancamentoFinanceiro do tipo DESPESA com:
       - categoria: "INSUMO"
       - valor: saida.custo_total
       - data: saida.data
       - descricao: f"Saída de {saida.insumo.nome} - {saida.quantidade} {saida.insumo.unidade_medida}"
       - referencia: saida (FK genérica ou via content_type)
    3. Atualizar o saldo acumulado da safra
    4. Usar transaction.atomic() para garantir consistência

    Por ora, apenas seta a flag lancado_financeiro=True como placeholder.
    """
    SaidaEstoque.objects.filter(pk=saida.pk).update(lancado_financeiro=True)


def _emitir_alerta_estoque_minimo(insumo: Insumo) -> None:
    """
    RF-42: Emite alerta quando estoque_atual <= estoque_minimo.

    TODO: Implementar notificação real futura
    -------------------------------------------------
    Quando o módulo de notificações for implementado, esta função deverá:
    1. Criar uma Notificacao para o owner do insumo com:
       - tipo: "ALERTA_ESTOQUE"
       - titulo: f"Estoque baixo: {insumo.nome}"
       - mensagem: detalhes do estoque atual vs mínimo
       - prioridade: ALTA
    2. Opcionalmente enviar e-mail/push notification via Celery task
    3. Evitar alertas duplicados (debounce por insumo_id + intervalo de tempo)

    Por ora, apenas registra um warning no logger.
    """
    logger.warning(
        "ALERTA ESTOQUE MÍNIMO | Insumo: %s (ID: %d) | "
        "Propriedade: %s | Estoque atual: %s | Estoque mínimo: %s",
        insumo.nome,
        insumo.pk,
        insumo.propriedade.nome,
        insumo.estoque_atual,
        insumo.estoque_minimo,
    )
