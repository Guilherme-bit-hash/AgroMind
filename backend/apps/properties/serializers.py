from decimal import Decimal
from rest_framework import serializers
from .models import Propriedade, Talhao, UF, TipoSolo, Cultura, SistemaCultivo, Irrigacao


class TalhaoSerializer(serializers.ModelSerializer):
    tipo_solo_display = serializers.CharField(source="get_tipo_solo_display", read_only=True)
    cultura = serializers.SlugRelatedField(slug_field="nome", read_only=True)
    cultura_display = serializers.SerializerMethodField()
    sistema_cultivo_display = serializers.CharField(source="get_sistema_cultivo_display", read_only=True)
    irrigacao_display = serializers.CharField(source="get_irrigacao_display", read_only=True)

    def get_cultura_display(self, obj):
        return obj.cultura.nome if obj.cultura else None

    class Meta:
        model = Talhao
        fields = [
            "id", "nome", "codigo",
            "area", "area_produtiva", "declividade",
            "tipo_solo", "tipo_solo_display", "ph_solo",
            "cultura", "cultura_display",
            "safra", "sistema_cultivo", "sistema_cultivo_display",
            "irrigacao", "irrigacao_display",
            "pragas_doencas", "observacoes",
            "latitude", "longitude",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]


class TalhaoCreateSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=100)
    codigo = serializers.CharField(max_length=40, required=False, allow_blank=True)
    area = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))
    area_produtiva = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    declividade = serializers.DecimalField(max_digits=5, decimal_places=1, required=False, allow_null=True)
    tipo_solo = serializers.ChoiceField(choices=TipoSolo.choices)
    ph_solo = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    cultura = serializers.SlugRelatedField(
        queryset=Cultura.objects.all(),
        slug_field="nome",
        required=False,
        allow_null=True,
        error_messages={"does_not_exist": "Objeto com nome '{value}' não encontrado."}
    )
    safra = serializers.CharField(max_length=10, required=False, allow_blank=True)
    sistema_cultivo = serializers.ChoiceField(choices=SistemaCultivo.choices, required=False)
    irrigacao = serializers.ChoiceField(choices=Irrigacao.choices, required=False)
    pragas_doencas = serializers.CharField(required=False, allow_blank=True)
    observacoes = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)


class TalhaoUpdateSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=100, required=False)
    codigo = serializers.CharField(max_length=40, required=False, allow_blank=True)
    area = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"), required=False)
    area_produtiva = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    declividade = serializers.DecimalField(max_digits=5, decimal_places=1, required=False, allow_null=True)
    tipo_solo = serializers.ChoiceField(choices=TipoSolo.choices, required=False)
    ph_solo = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    cultura = serializers.SlugRelatedField(
        queryset=Cultura.objects.all(),
        slug_field="nome",
        required=False,
        allow_null=True,
        error_messages={"does_not_exist": "Objeto com nome '{value}' não encontrado."}
    )
    safra = serializers.CharField(max_length=10, required=False, allow_blank=True)
    sistema_cultivo = serializers.ChoiceField(choices=SistemaCultivo.choices, required=False)
    irrigacao = serializers.ChoiceField(choices=Irrigacao.choices, required=False)
    pragas_doencas = serializers.CharField(required=False, allow_blank=True)
    observacoes = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)


class PropriedadeSerializer(serializers.ModelSerializer):
    uf_display = serializers.CharField(source="get_uf_display", read_only=True)
    talhoes = TalhaoSerializer(many=True, read_only=True)

    class Meta:
        model = Propriedade
        fields = [
            "id", "nome", "area_total", "municipio", "uf", "uf_display",
            "latitude", "longitude", "is_active", "talhoes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]


class PropriedadeCreateSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=150)
    area_total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))
    municipio = serializers.CharField(max_length=100)
    uf = serializers.ChoiceField(choices=UF.choices)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)


class PropriedadeUpdateSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=150, required=False)
    area_total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"), required=False)
    municipio = serializers.CharField(max_length=100, required=False)
    uf = serializers.ChoiceField(choices=UF.choices, required=False)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)