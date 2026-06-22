# apps/estoque/tests/factories.py
# Python 3.12+ | Django 5.x | factory-boy
# Factories para testes do módulo de Estoque de Insumos — Sprint 03

import factory
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model

from apps.properties.models import Propriedade, Talhao
from apps.planting.models import Safra
from apps.estoque.models import Insumo, EntradaEstoque, SaidaEstoque


User = get_user_model()


# ── Factories de dependência ─────────────────────────────────────────────────

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email    = factory.Sequence(lambda n: f"user{n}@agro.com")
    name     = factory.Faker("name", locale="pt_BR")
    password = factory.PostGenerationMethodCall("set_password", "Senha@1234")


class PropriedadeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Propriedade

    owner      = factory.SubFactory(UserFactory)
    nome       = factory.Sequence(lambda n: f"Fazenda Teste {n}")
    area_total = Decimal("250.00")
    municipio  = "Planaltina"
    uf         = "GO"
    latitude   = Decimal("-15.456321")
    longitude  = Decimal("-47.654321")


class TalhaoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Talhao

    propriedade = factory.SubFactory(PropriedadeFactory)
    nome        = factory.Sequence(lambda n: f"Talhão {n}")
    area        = Decimal("50.00")
    tipo_solo   = "argiloso"


class SafraFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Safra

    owner       = factory.SubFactory(UserFactory)
    propriedade = factory.SubFactory(PropriedadeFactory)
    nome        = factory.Sequence(lambda n: f"Safra 2026/{n}")
    cultura     = "soja"
    data_inicio = factory.LazyFunction(lambda: date.today())
    data_fim    = factory.LazyFunction(lambda: date.today() + timedelta(days=180))


# ── Factories do módulo de estoque ───────────────────────────────────────────

class InsumoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Insumo

    owner          = factory.SubFactory(UserFactory)
    propriedade    = factory.SubFactory(PropriedadeFactory)
    nome           = factory.Sequence(lambda n: f"Insumo Teste {n}")
    tipo           = "fertilizante"
    unidade_medida = "kg"
    fornecedor     = "Fornecedor ABC"
    preco_unitario = Decimal("50.00")
    estoque_minimo = Decimal("10.000")
    estoque_atual  = Decimal("100.000")


class EntradaEstoqueFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = EntradaEstoque

    insumo            = factory.SubFactory(InsumoFactory)
    data              = factory.LazyFunction(lambda: date.today())
    quantidade        = Decimal("50.000")
    preco_unitario    = Decimal("50.00")
    custo_total       = factory.LazyAttribute(lambda o: o.quantidade * o.preco_unitario)
    numero_nota_fiscal = ""
    created_by        = factory.SubFactory(UserFactory)


class SaidaEstoqueFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SaidaEstoque

    insumo                 = factory.SubFactory(InsumoFactory)
    talhao                 = factory.SubFactory(TalhaoFactory)
    safra                  = None
    data                   = factory.LazyFunction(lambda: date.today())
    quantidade             = Decimal("10.000")
    preco_unitario_snapshot = Decimal("50.00")
    custo_total            = factory.LazyAttribute(lambda o: o.quantidade * o.preco_unitario_snapshot)
    lancado_financeiro     = False
    created_by             = factory.SubFactory(UserFactory)
