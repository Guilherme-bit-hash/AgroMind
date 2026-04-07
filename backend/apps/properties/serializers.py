# apps/properties/serializers.py
# Python 3.12+ | Django 5.x | DRF
# Serializers para CRUD de Propriedade e Talhão.

from rest_framework import serializers
from .models import Propriedade, Talhao, UF, TipoSolo


class TalhaoSerializer(serializers.ModelSerializer):
    tipo_solo_display = serializers.CharField(source="get_tipo_solo_display", read_only=True)

    class Meta:
        model  = Talhao
        fields = [
            "id", "nome", "area", "tipo_solo", "tipo_solo_display",
            "latitude", "longitude", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]


class TalhaoCreateSerializer(serializers.Serializer):
    nome      = serializers.CharField(max_length=100)
    area      = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    tipo_solo = serializers.ChoiceField(choices=TipoSolo.choices)
    latitude  = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)


class TalhaoUpdateSerializer(serializers.Serializer):
    nome      = serializers.CharField(max_length=100, required=False)
    area      = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01, required=False)
    tipo_solo = serializers.ChoiceField(choices=TipoSolo.choices, required=False)
    latitude  = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)


class PropriedadeSerializer(serializers.ModelSerializer):
    uf_display = serializers.CharField(source="get_uf_display", read_only=True)
    talhoes    = TalhaoSerializer(many=True, read_only=True)

    class Meta:
        model  = Propriedade
        fields = [
            "id", "nome", "area_total", "municipio", "uf", "uf_display",
            "latitude", "longitude", "is_active", "talhoes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]


class PropriedadeCreateSerializer(serializers.Serializer):
    nome       = serializers.CharField(max_length=150)
    area_total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    municipio  = serializers.CharField(max_length=100)
    uf         = serializers.ChoiceField(choices=UF.choices)
    latitude   = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude  = serializers.DecimalField(max_digits=9, decimal_places=6)


class PropriedadeUpdateSerializer(serializers.Serializer):
    nome       = serializers.CharField(max_length=150, required=False)
    area_total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01, required=False)
    municipio  = serializers.CharField(max_length=100, required=False)
    uf         = serializers.ChoiceField(choices=UF.choices, required=False)
    latitude   = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude  = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
