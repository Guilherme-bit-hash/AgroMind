# apps/planting/forms.py
from django import forms
from .models import SimulacaoSafra

class SimulacaoSafraForm(forms.ModelForm):
    class Meta:
        model = SimulacaoSafra
        fields = [
            "nome",
            "cultura",
            "area_hectares",
            "nivel_tecnologico",
            "preco_saca_esperado",
            
            # Campos preenchidos via JS e submetidos de forma oculta ou read-only
            "custo_sementes",
            "custo_fertilizantes",
            "custo_defensivos",
            "produtividade_esperada",
            "custo_total_estimado",
            "receita_projetada",
            "margem_lucro",
            "ponto_equilibrio",
        ]
        widgets = {
            "nome": forms.TextInput(attrs={"placeholder": "Ex: Safra de Inverno 2026"}),
        }
