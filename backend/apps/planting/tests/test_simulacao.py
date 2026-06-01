# apps/planting/tests/test_simulacao.py
# Python 3.12+ | Django 5.x | pytest

import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from apps.planting.models import SimulacaoSafra
from apps.planting.forms import SimulacaoSafraForm

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="produtor@agro.com",
        name="Produtor Teste",
        password="Senha@1234",
    )

@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="outro@agro.com",
        name="Outro Produtor",
        password="Senha@1234",
    )

@pytest.fixture
def simulacao(db, user):
    return SimulacaoSafra.objects.create(
        owner=user,
        nome="Simulação Teste Soja",
        cultura="soja",
        area_hectares=Decimal("100.00"),
        custo_por_hectare=Decimal("3000.00"),
        produtividade_esperada=Decimal("60.00"),
        preco_saca_esperado=Decimal("150.00"),
    )

# ── Testes Unitários: Cálculos Financeiros e Persistência ───────────────────

@pytest.mark.django_db
def test_simulacao_calculos_financeiros(user):
    """
    Verifica se a fórmula de Custo Total, Receita, Margem e Ponto de Equilíbrio
    são calculados corretamente no save() do model.
    """
    sim = SimulacaoSafra.objects.create(
        owner=user,
        nome="Projeção Milho 2026",
        cultura="milho",
        area_hectares=Decimal("50.00"),
        custo_por_hectare=Decimal("4000.00"),
        produtividade_esperada=Decimal("120.00"),
        preco_saca_esperado=Decimal("80.00"),
    )

    # custo_total = area * custo_por_hectare
    # 50 * 4000 = 200.000,00
    assert sim.custo_total_estimado == Decimal("200000.00")

    # producao_total = area * produtividade_esperada = 50 * 120 = 6000 sacas
    # receita_projetada = producao_total * preco_saca = 6000 * 80 = 480.000,00
    assert sim.receita_projetada == Decimal("480000.00")

    # margem_lucro = ((receita - custo) / receita) * 100
    # ((480.000 - 200.000) / 480.000) * 100 = (280.000 / 480.000) * 100 = 58.333%
    assert round(sim.margem_lucro, 2) == Decimal("58.33")

    # ponto_equilibrio = custo_total / preco_saca = 200.000 / 80 = 2500 sacas
    assert sim.ponto_equilibrio == Decimal("2500.00")


@pytest.mark.django_db
def test_simulacao_lucro_negativo(user):
    """
    Testa os cálculos quando a receita esperada for menor que o custo total (prejuízo).
    """
    sim = SimulacaoSafra.objects.create(
        owner=user,
        nome="Projeção Milho Prejuízo",
        cultura="milho",
        area_hectares=Decimal("10.00"),
        custo_por_hectare=Decimal("5000.00"),  # custo_total = 50.000
        produtividade_esperada=Decimal("50.00"), # producao_total = 500 sacas
        preco_saca_esperado=Decimal("60.00"),     # receita = 30.000
    )
    
    assert sim.custo_total_estimado == Decimal("50000.00")
    assert sim.receita_projetada == Decimal("30000.00")
    # margem = ((30.000 - 50.000) / 30.000) * 100 = -66.67%
    assert round(sim.margem_lucro, 2) == Decimal("-66.67")
    assert sim.ponto_equilibrio == Decimal("833.33") # 50000 / 60


# ── Testes Unitários: Validações de Form ────────────────────────────────────

def test_form_validacoes_campos_positivos():
    """
    Verifica se o formulário falha quando valores numéricos menores ou iguais a zero são fornecidos.
    """
    # Caso 1: Área <= 0
    form1 = SimulacaoSafraForm(data={
        "nome": "Safra Teste",
        "cultura": "soja",
        "area_hectares": "0",
        "custo_por_hectare": "3000",
        "produtividade_esperada": "60",
        "preco_saca_esperado": "150",
    })
    assert not form1.is_valid()
    assert "area_hectares" in form1.errors

    # Caso 2: Custo <= 0
    form2 = SimulacaoSafraForm(data={
        "nome": "Safra Teste",
        "cultura": "soja",
        "area_hectares": "100",
        "custo_por_hectare": "-5",
        "produtividade_esperada": "60",
        "preco_saca_esperado": "150",
    })
    assert not form2.is_valid()
    assert "custo_por_hectare" in form2.errors

    # Caso 3: Produtividade <= 0
    form3 = SimulacaoSafraForm(data={
        "nome": "Safra Teste",
        "cultura": "soja",
        "area_hectares": "100",
        "custo_por_hectare": "3000",
        "produtividade_esperada": "0",
        "preco_saca_esperado": "150",
    })
    assert not form3.is_valid()
    assert "produtividade_esperada" in form3.errors

    # Caso 4: Preço Saca <= 0
    form4 = SimulacaoSafraForm(data={
        "nome": "Safra Teste",
        "cultura": "soja",
        "area_hectares": "100",
        "custo_por_hectare": "3000",
        "produtividade_esperada": "60",
        "preco_saca_esperado": "-10",
    })
    assert not form4.is_valid()
    assert "preco_saca_esperado" in form4.errors


def test_form_valido_sucesso():
    """
    Verifica se o formulário é válido com dados corretos.
    """
    form = SimulacaoSafraForm(data={
        "nome": "Safra Teste Válida",
        "cultura": "soja",
        "area_hectares": "85.5",
        "custo_por_hectare": "2850.00",
        "produtividade_esperada": "65",
        "preco_saca_esperado": "142.50",
    })
    assert form.is_valid()


# ── Testes de Integração: Views e Fluxo de Usuário ──────────────────────────

@pytest.mark.django_db
def test_view_listagem_simulacoes(client, user, other_user, simulacao):
    """
    Testa se a listagem exibe somente as simulações pertencentes ao usuário logado.
    """
    # Cria uma simulação para o outro usuário
    SimulacaoSafra.objects.create(
        owner=other_user,
        nome="Outra fazenda",
        cultura="cafe",
        area_hectares=Decimal("20.00"),
        custo_por_hectare=Decimal("5000.00"),
        produtividade_esperada=Decimal("40.00"),
        preco_saca_esperado=Decimal("200.00"),
    )

    client.force_login(user)
    response = client.get(reverse("web_planting:simulacao_list"))
    
    assert response.status_code == 200
    assert len(response.context["simulacoes"]) == 1
    assert response.context["simulacoes"][0].nome == "Simulação Teste Soja"


@pytest.mark.django_db
def test_view_cria_simulacao_post(client, user):
    """
    Testa o envio de dados via POST para a criação da simulação.
    """
    client.force_login(user)
    payload = {
        "nome": "Safra Café Premium 2026",
        "cultura": "cafe",
        "area_hectares": "30.00",
        "custo_por_hectare": "5000.00",
        "produtividade_esperada": "45.00",
        "preco_saca_esperado": "220.00",
    }
    
    response = client.post(reverse("web_planting:simulacao_create"), data=payload)
    
    # Redireciona para listagem de simulações
    assert response.status_code == 302
    assert SimulacaoSafra.objects.filter(nome="Safra Café Premium 2026").exists()
    
    sim = SimulacaoSafra.objects.get(nome="Safra Café Premium 2026")
    assert sim.owner == user
    # 30 * 5000 = 150.000
    assert sim.custo_total_estimado == Decimal("150000.00")
    # 30 * 45 * 220 = 297.000
    assert sim.receita_projetada == Decimal("297000.00")


@pytest.mark.django_db
def test_view_detalhe_simulacao(client, user, simulacao):
    """
    Testa se o detalhe de uma simulação é exibido corretamente.
    """
    client.force_login(user)
    response = client.get(reverse("web_planting:simulacao_detail", kwargs={"pk": simulacao.pk}))
    
    assert response.status_code == 200
    assert response.context["simulacao"].nome == "Simulação Teste Soja"
    assert "Custo por Hectare:" in response.content.decode("utf-8")


@pytest.mark.django_db
def test_view_detalhe_simulacao_alheia_retorna_404(client, other_user, simulacao):
    """
    Testa se o detalhe de uma simulação de outro usuário retorna erro 404 (isolamento).
    """
    client.force_login(other_user)
    response = client.get(reverse("web_planting:simulacao_detail", kwargs={"pk": simulacao.pk}))
    assert response.status_code == 404


@pytest.mark.django_db
def test_view_exclui_simulacao(client, user, simulacao):
    """
    Testa se a exclusão individual da simulação funciona corretamente.
    """
    client.force_login(user)
    pk = simulacao.pk
    response = client.post(reverse("web_planting:simulacao_delete", kwargs={"pk": pk}))
    
    assert response.status_code == 302
    assert not SimulacaoSafra.objects.filter(pk=pk).exists()


@pytest.mark.django_db
def test_view_exclusao_em_massa(client, user, other_user, simulacao):
    """
    Testa se a exclusão em massa limpa todas as simulações apenas do usuário logado.
    """
    # Cria uma simulação para o outro usuário
    sim_outro = SimulacaoSafra.objects.create(
        owner=other_user,
        nome="Simulação Alheia",
        cultura="soja",
        area_hectares=Decimal("50.00"),
        custo_por_hectare=Decimal("3000.00"),
        produtividade_esperada=Decimal("60.00"),
        preco_saca_esperado=Decimal("150.00"),
    )

    client.force_login(user)
    response = client.post(reverse("web_planting:simulacao_bulk_delete"))
    
    assert response.status_code == 302
    # Simulacao do produtor deve ser excluida
    assert not SimulacaoSafra.objects.filter(owner=user).exists()
    # Simulacao do outro produtor deve ser preservada
    assert SimulacaoSafra.objects.filter(pk=sim_outro.pk).exists()
