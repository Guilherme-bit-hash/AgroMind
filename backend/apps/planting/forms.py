# apps/planting/forms.py
from django import forms
from .models import SimulacaoSafra

class SimulacaoSafraForm(forms.ModelForm):
    custo_total_estimado = forms.DecimalField(required=False)
    receita_projetada = forms.DecimalField(required=False)
    margem_lucro = forms.DecimalField(required=False)
    ponto_equilibrio = forms.DecimalField(required=False)

    class Meta:
        model = SimulacaoSafra
        fields = [
            "nome",
            "cultura",
            "area_hectares",
            "custo_por_hectare",
            "produtividade_esperada",
            "preco_saca_esperado",
            
            # Campos preenchidos e submetidos de forma oculta ou read-only
            "custo_total_estimado",
            "receita_projetada",
            "margem_lucro",
            "ponto_equilibrio",
        ]
        widgets = {
            "nome": forms.TextInput(attrs={"placeholder": "Ex: Safra de Inverno 2026"}),
        }

    def clean(self):
        cleaned_data = super().clean()
        area_hectares = cleaned_data.get("area_hectares")
        custo_por_hectare = cleaned_data.get("custo_por_hectare")
        produtividade_esperada = cleaned_data.get("produtividade_esperada")
        preco_saca_esperado = cleaned_data.get("preco_saca_esperado")

        if area_hectares is not None and area_hectares <= 0:
            self.add_error("area_hectares", "A área plantada deve ser maior que zero.")
        if custo_por_hectare is not None and custo_por_hectare <= 0:
            self.add_error("custo_por_hectare", "O custo por hectare deve ser maior que zero.")
        if produtividade_esperada is not None and produtividade_esperada <= 0:
            self.add_error("produtividade_esperada", "A produtividade esperada deve ser maior que zero.")
        if preco_saca_esperado is not None and preco_saca_esperado <= 0:
            self.add_error("preco_saca_esperado", "O preço da saca deve ser maior que zero.")

        return cleaned_data
