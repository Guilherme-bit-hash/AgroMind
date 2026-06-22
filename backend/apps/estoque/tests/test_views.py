# apps/estoque/tests/test_views.py
# Python 3.12+ | Django 5.x | pytest
# Testes de API (views) do módulo de Estoque de Insumos — Sprint 03

import pytest
from datetime import date
from decimal import Decimal

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

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
    return TalhaoFactory(propriedade=propriedade, nome="Talhão API")


@pytest.fixture
def insumo(owner, propriedade):
    return InsumoFactory(
        owner=owner,
        propriedade=propriedade,
        nome="Adubo API",
        estoque_atual=Decimal("100.000"),
        estoque_minimo=Decimal("10.000"),
        preco_unitario=Decimal("50.00"),
    )


@pytest.fixture
def client_auth(owner):
    client = APIClient()
    refresh = RefreshToken.for_user(owner)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


@pytest.fixture
def client_other(other_owner):
    client = APIClient()
    refresh = RefreshToken.for_user(other_owner)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


# ── URL base helper ──────────────────────────────────────────────────────────

def _base_url(propriedade_id: int) -> str:
    return f"/api/v1/propriedades/{propriedade_id}/insumos/"


# ── 14. test_api_list_insumos_isolamento_por_owner ───────────────────────────

@pytest.mark.django_db
def test_api_list_insumos_isolamento_por_owner(
    client_auth, client_other, owner, other_owner, propriedade, other_propriedade
):
    """
    Um owner deve ver apenas seus insumos.
    Outro owner autenticado não deve ver insumos de propriedade alheia.
    """
    # Criar insumo para cada owner
    InsumoFactory(owner=owner, propriedade=propriedade, nome="Adubo Owner 1")
    InsumoFactory(owner=other_owner, propriedade=other_propriedade, nome="Adubo Owner 2")

    # Owner 1 vê apenas seus insumos
    response = client_auth.get(_base_url(propriedade.pk))
    assert response.status_code == 200
    nomes = [i["nome"] for i in response.data]
    assert "Adubo Owner 1" in nomes
    assert "Adubo Owner 2" not in nomes

    # Owner 2 tenta acessar propriedade do owner 1 → 404
    response = client_other.get(_base_url(propriedade.pk))
    assert response.status_code == 404


# ── 15. test_api_alertas_retorna_somente_insumos_abaixo_do_minimo ────────────

@pytest.mark.django_db
def test_api_alertas_retorna_somente_insumos_abaixo_do_minimo(
    client_auth, owner, propriedade
):
    """RF-42: Endpoint de alertas deve retornar somente insumos com estoque crítico."""
    # Insumo ABAIXO do mínimo: estoque_atual (5) <= estoque_minimo (10)
    InsumoFactory(
        owner=owner, propriedade=propriedade,
        nome="Crítico", estoque_atual=Decimal("5.000"), estoque_minimo=Decimal("10.000"),
    )
    # Insumo ACIMA do mínimo: estoque_atual (50) > estoque_minimo (10)
    InsumoFactory(
        owner=owner, propriedade=propriedade,
        nome="Normal", estoque_atual=Decimal("50.000"), estoque_minimo=Decimal("10.000"),
    )

    url = _base_url(propriedade.pk) + "alertas/"
    response = client_auth.get(url)
    assert response.status_code == 200
    nomes = [i["nome"] for i in response.data]
    assert "Crítico" in nomes
    assert "Normal" not in nomes


# ── 16. test_api_cria_insumo_sucesso ─────────────────────────────────────────

@pytest.mark.django_db
def test_api_cria_insumo_sucesso(client_auth, propriedade):
    """RF-39: Criação de insumo via API."""
    payload = {
        "nome": "Glifosato",
        "tipo": "defensivo",
        "unidade_medida": "l",
        "preco_unitario": "35.00",
        "estoque_minimo": "5.000",
    }
    response = client_auth.post(_base_url(propriedade.pk), payload, format="json")
    assert response.status_code == 201
    assert response.data["nome"] == "Glifosato"
    assert response.data["estoque_atual"] == "0.000"


# ── 17. test_api_registra_entrada_via_api ────────────────────────────────────

@pytest.mark.django_db
def test_api_registra_entrada_via_api(client_auth, propriedade, insumo):
    """RF-40: Registro de entrada de estoque via API."""
    url = _base_url(propriedade.pk) + f"{insumo.pk}/entradas/"
    payload = {
        "data": str(date.today()),
        "quantidade": "20.000",
        "preco_unitario": "55.00",
        "numero_nota_fiscal": "NF-12345",
    }
    response = client_auth.post(url, payload, format="json")
    assert response.status_code == 201
    assert Decimal(response.data["custo_total"]) == Decimal("1100.00")


# ── 18. test_api_registra_saida_via_api ──────────────────────────────────────

@pytest.mark.django_db
def test_api_registra_saida_via_api(client_auth, propriedade, insumo, talhao):
    """RF-41: Registro de saída de estoque via API."""
    url = _base_url(propriedade.pk) + f"{insumo.pk}/saidas/"
    payload = {
        "talhao_id": talhao.pk,
        "data": str(date.today()),
        "quantidade": "10.000",
    }
    response = client_auth.post(url, payload, format="json")
    assert response.status_code == 201
    assert response.data["lancado_financeiro"] is True
