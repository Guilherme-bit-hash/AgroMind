# apps/estoque/admin.py
# Python 3.12+ | Django 5.x
# Configuração do Django Admin para Estoque de Insumos — Sprint 03

from django.contrib import admin
from .models import Insumo, EntradaEstoque, SaidaEstoque


class EntradaEstoqueInline(admin.TabularInline):
    model           = EntradaEstoque
    extra           = 0
    fields          = ("data", "quantidade", "preco_unitario", "custo_total", "numero_nota_fiscal", "created_by")
    readonly_fields = ("custo_total", "created_at")


class SaidaEstoqueInline(admin.TabularInline):
    model           = SaidaEstoque
    extra           = 0
    fields          = ("data", "talhao", "safra", "quantidade", "preco_unitario_snapshot", "custo_total", "lancado_financeiro", "created_by")
    readonly_fields = ("preco_unitario_snapshot", "custo_total", "lancado_financeiro", "created_at")


@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display    = ("nome", "tipo", "propriedade", "estoque_atual", "estoque_minimo", "is_active", "abaixo_minimo")
    list_filter     = ("tipo", "unidade_medida", "is_active")
    search_fields   = ("nome", "fornecedor", "propriedade__nome")
    readonly_fields = ("estoque_atual", "created_at", "updated_at")
    inlines         = [EntradaEstoqueInline, SaidaEstoqueInline]

    @admin.display(boolean=True, description="Abaixo do mínimo?")
    def abaixo_minimo(self, obj):
        return obj.abaixo_estoque_minimo


@admin.register(EntradaEstoque)
class EntradaEstoqueAdmin(admin.ModelAdmin):
    list_display    = ("insumo", "data", "quantidade", "preco_unitario", "custo_total", "created_by")
    list_filter     = ("data",)
    search_fields   = ("insumo__nome", "numero_nota_fiscal")
    readonly_fields = ("custo_total", "created_at")


@admin.register(SaidaEstoque)
class SaidaEstoqueAdmin(admin.ModelAdmin):
    list_display    = ("insumo", "talhao", "data", "quantidade", "custo_total", "lancado_financeiro", "created_by")
    list_filter     = ("data", "lancado_financeiro")
    search_fields   = ("insumo__nome", "talhao__nome")
    readonly_fields = ("preco_unitario_snapshot", "custo_total", "lancado_financeiro", "created_at")
