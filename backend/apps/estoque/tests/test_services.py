# apps/estoque/tests/test_services.py
# Python 3.12+ | Django 5.x | pytest
# Testes de services do módulo de Estoque de Insumos — Sprint 03

import pytest
from datetime import date
from decimal import Decimal

from django.core.exceptions import ValidationError

from apps.estoque import services, selectors
from apps.estoque.models import Insumo, EntradaEstoque, SaidaEstoque
from apps.estoque.tests.factories import (
    UserFactory,
    PropriedadeFactory,
    TalhaoFactory,
    InsumoFactory,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def owner(db):
    return UserFactory()


@pytest.fixture
def other_owner(db):
    return UserFactory()


@pytest.fixture
def propriedade(owner):
    return PropriedadeFactory(owner=owner)


@pytest.fixture
def other_propriedade(other_owner):
    return PropriedadeFactory(owner=other_owner)


@pytest.fixture
def talhao(propriedade):
    return TalhaoFactory(propriedade=propriedade, nome="Talhão Principal")


@pytest.fixture
def insumo(owner, propriedade):
    return InsumoFactory(
        owner=owner,
        propriedade=propriedade,
        nome="Adubo NPK",
        estoque_atual=Decimal("100.000"),
        estoque_minimo=Decimal("10.000"),
        preco_unitario=Decimal("50.00"),
    )


# ── 1. test_registrar_insumo_sucesso ─────────────────────────────────────────

@pytest.mark.django_db
def test_registrar_insumo_sucesso(owner, propriedade):
    """RF-39: Cadastro de insumo com sucesso."""
    insumo = services.create_insumo(
        owner=owner,
        propriedade_id=propriedade.pk,
        nome="Ureia",
        tipo="fertilizante",
        unidade_medida="kg",
        preco_unitario=Decimal("45.00"),
        estoque_minimo=Decimal("5.000"),
    )
    assert insumo.pk is not None
    assert insumo.nome == "Ureia"
    assert insumo.owner == owner
    assert insumo.propriedade == propriedade
    assert insumo.estoque_atual == Decimal("0")
    assert insumo.is_active is True


# ── 2. test_registrar_insumo_nome_duplicado_mesma_propriedade_raises ─────────

@pytest.mark.django_db
def test_registrar_insumo_nome_duplicado_mesma_propriedade_raises(owner, propriedade):
    """RF-39: Nome de insumo duplicado na mesma propriedade deve falhar."""
    services.create_insumo(
        owner=owner,
        propriedade_id=propriedade.pk,
        nome="Ureia",
        tipo="fertilizante",
        unidade_medida="kg",
        preco_unitario=Decimal("45.00"),
    )
    with pytest.raises(Exception):
        services.create_insumo(
            owner=owner,
            propriedade_id=propriedade.pk,
            nome="Ureia",
            tipo="fertilizante",
            unidade_medida="kg",
            preco_unitario=Decimal("45.00"),
        )


# ── 3. test_registrar_insumo_propriedade_de_outro_owner_raises_404 ──────────

@pytest.mark.django_db
def test_registrar_insumo_propriedade_de_outro_owner_raises_404(owner, other_propriedade):
    """RF-39: Tentativa de cadastrar insumo em propriedade de outro owner."""
    with pytest.raises(Exception):
        services.create_insumo(
            owner=owner,
            propriedade_id=other_propriedade.pk,
            nome="Glifosato",
            tipo="defensivo",
            unidade_medida="l",
            preco_unitario=Decimal("30.00"),
        )


# ── 4. test_inativar_insumo_soft_delete_preserva_historico ───────────────────

@pytest.mark.django_db
def test_inativar_insumo_soft_delete_preserva_historico(insumo, owner, talhao):
    """Soft delete: inativa o insumo mas preserva registros de entradas/saídas."""
    # Criar uma entrada para ter histórico
    services.registrar_entrada(
        owner=owner,
        insumo_id=insumo.pk,
        data=date.today(),
        quantidade=Decimal("20.000"),
        preco_unitario=Decimal("50.00"),
    )

    insumo_id = insumo.pk
    services.deactivate_insumo(insumo=insumo)

    # Insumo está inativo
    insumo.refresh_from_db()
    assert insumo.is_active is False

    # Mas o histórico de entradas continua acessível
    entradas = EntradaEstoque.objects.filter(insumo_id=insumo_id)
    assert entradas.count() == 1


# ── 5. test_registrar_entrada_incrementa_estoque_atual ───────────────────────

@pytest.mark.django_db
def test_registrar_entrada_incrementa_estoque_atual(insumo, owner):
    """RF-40: Entrada de estoque deve incrementar estoque_atual atomicamente."""
    estoque_antes = insumo.estoque_atual

    services.registrar_entrada(
        owner=owner,
        insumo_id=insumo.pk,
        data=date.today(),
        quantidade=Decimal("25.000"),
        preco_unitario=Decimal("50.00"),
    )

    insumo.refresh_from_db()
    assert insumo.estoque_atual == estoque_antes + Decimal("25.000")


# ── 6. test_registrar_entrada_quantidade_zero_raises_validation_error ────────

@pytest.mark.django_db
def test_registrar_entrada_quantidade_zero_raises_validation_error(insumo, owner):
    """RF-40: Quantidade zero ou negativa deve ser rejeitada."""
    with pytest.raises(ValidationError, match="maior que zero"):
        services.registrar_entrada(
            owner=owner,
            insumo_id=insumo.pk,
            data=date.today(),
            quantidade=Decimal("0"),
            preco_unitario=Decimal("50.00"),
        )


# ── 7. test_registrar_saida_decrementa_estoque_atual ─────────────────────────

@pytest.mark.django_db
def test_registrar_saida_decrementa_estoque_atual(insumo, owner, talhao):
    """RF-41: Saída de estoque deve decrementar estoque_atual atomicamente."""
    estoque_antes = insumo.estoque_atual

    services.registrar_saida(
        owner=owner,
        insumo_id=insumo.pk,
        talhao_id=talhao.pk,
        data=date.today(),
        quantidade=Decimal("15.000"),
    )

    insumo.refresh_from_db()
    assert insumo.estoque_atual == estoque_antes - Decimal("15.000")


# ── 8. test_registrar_saida_quantidade_maior_que_estoque_raises ──────────────

@pytest.mark.django_db
def test_registrar_saida_quantidade_maior_que_estoque_raises_validation_error(insumo, owner, talhao):
    """RF-41: Saída maior que estoque disponível deve ser rejeitada."""
    with pytest.raises(ValidationError, match="Estoque insuficiente"):
        services.registrar_saida(
            owner=owner,
            insumo_id=insumo.pk,
            talhao_id=talhao.pk,
            data=date.today(),
            quantidade=Decimal("999.000"),
        )


# ── 9. test_registrar_saida_seta_flag_lancado_financeiro ─────────────────────

@pytest.mark.django_db
def test_registrar_saida_seta_flag_lancado_financeiro(insumo, owner, talhao):
    """RF-44: Saída deve setar lancado_financeiro=True (stub)."""
    saida = services.registrar_saida(
        owner=owner,
        insumo_id=insumo.pk,
        talhao_id=talhao.pk,
        data=date.today(),
        quantidade=Decimal("5.000"),
    )

    saida.refresh_from_db()
    assert saida.lancado_financeiro is True


# ── 10. test_alerta_minimo_detectado_apos_saida_critica ──────────────────────

@pytest.mark.django_db
def test_alerta_minimo_detectado_apos_saida_critica(owner, propriedade, talhao):
    """RF-42: Alerta deve ser detectado quando estoque cai abaixo do mínimo."""
    insumo = InsumoFactory(
        owner=owner,
        propriedade=propriedade,
        nome="Defensivo X",
        estoque_atual=Decimal("15.000"),
        estoque_minimo=Decimal("10.000"),
        preco_unitario=Decimal("80.00"),
    )

    # Saída que deixa estoque_atual = 5.000 (abaixo de 10.000)
    services.registrar_saida(
        owner=owner,
        insumo_id=insumo.pk,
        talhao_id=talhao.pk,
        data=date.today(),
        quantidade=Decimal("10.000"),
    )

    insumo.refresh_from_db()
    assert insumo.abaixo_estoque_minimo is True

    # Verifica que aparece no selector de alertas
    alertas = selectors.get_insumos_abaixo_estoque_minimo(
        owner=owner, propriedade_id=propriedade.pk,
    )
    assert insumo in alertas


# ── 11. test_alerta_minimo_nao_acionado_quando_acima_do_minimo ───────────────

@pytest.mark.django_db
def test_alerta_minimo_nao_acionado_quando_acima_do_minimo(owner, propriedade, talhao):
    """RF-42: Não deve haver alerta quando estoque está acima do mínimo."""
    insumo = InsumoFactory(
        owner=owner,
        propriedade=propriedade,
        nome="Semente Y",
        estoque_atual=Decimal("100.000"),
        estoque_minimo=Decimal("10.000"),
        preco_unitario=Decimal("30.00"),
    )

    # Saída pequena que mantém estoque acima do mínimo
    services.registrar_saida(
        owner=owner,
        insumo_id=insumo.pk,
        talhao_id=talhao.pk,
        data=date.today(),
        quantidade=Decimal("5.000"),
    )

    insumo.refresh_from_db()
    assert insumo.abaixo_estoque_minimo is False

    alertas = selectors.get_insumos_abaixo_estoque_minimo(
        owner=owner, propriedade_id=propriedade.pk,
    )
    assert insumo not in alertas


# ── 12. test_historico_entradas_retorna_apenas_do_insumo_correto ─────────────

@pytest.mark.django_db
def test_historico_entradas_retorna_apenas_do_insumo_correto(owner, propriedade):
    """RF-43: Histórico de entradas deve retornar apenas do insumo correto."""
    insumo_a = InsumoFactory(
        owner=owner, propriedade=propriedade, nome="Insumo A",
        estoque_atual=Decimal("0"),
    )
    insumo_b = InsumoFactory(
        owner=owner, propriedade=propriedade, nome="Insumo B",
        estoque_atual=Decimal("0"),
    )

    services.registrar_entrada(
        owner=owner, insumo_id=insumo_a.pk,
        data=date.today(), quantidade=Decimal("10.000"),
        preco_unitario=Decimal("20.00"),
    )
    services.registrar_entrada(
        owner=owner, insumo_id=insumo_b.pk,
        data=date.today(), quantidade=Decimal("5.000"),
        preco_unitario=Decimal("15.00"),
    )

    entradas_a = selectors.get_entradas_by_insumo(insumo=insumo_a)
    assert entradas_a.count() == 1
    assert all(e.insumo == insumo_a for e in entradas_a)


# ── 13. test_historico_saidas_ordenado_por_data_decrescente ──────────────────

@pytest.mark.django_db
def test_historico_saidas_ordenado_por_data_decrescente(insumo, owner, talhao):
    """RF-43: Saídas devem ser retornadas ordenadas por data desc."""
    from datetime import timedelta

    services.registrar_saida(
        owner=owner, insumo_id=insumo.pk, talhao_id=talhao.pk,
        data=date.today() - timedelta(days=5),
        quantidade=Decimal("5.000"),
    )
    services.registrar_saida(
        owner=owner, insumo_id=insumo.pk, talhao_id=talhao.pk,
        data=date.today(),
        quantidade=Decimal("3.000"),
    )

    saidas = selectors.get_saidas_by_insumo(insumo=insumo)
    datas = [s.data for s in saidas]
    assert datas == sorted(datas, reverse=True)
