# apps/properties/models.py
from django.db import models
from django.conf import settings


class UF(models.TextChoices):
    AC = "AC", "Acre"
    AL = "AL", "Alagoas"
    AP = "AP", "Amapá"
    AM = "AM", "Amazonas"
    BA = "BA", "Bahia"
    CE = "CE", "Ceará"
    DF = "DF", "Distrito Federal"
    ES = "ES", "Espírito Santo"
    GO = "GO", "Goiás"
    MA = "MA", "Maranhão"
    MT = "MT", "Mato Grosso"
    MS = "MS", "Mato Grosso do Sul"
    MG = "MG", "Minas Gerais"
    PA = "PA", "Pará"
    PB = "PB", "Paraíba"
    PR = "PR", "Paraná"
    PE = "PE", "Pernambuco"
    PI = "PI", "Piauí"
    RJ = "RJ", "Rio de Janeiro"
    RN = "RN", "Rio Grande do Norte"
    RS = "RS", "Rio Grande do Sul"
    RO = "RO", "Rondônia"
    RR = "RR", "Roraima"
    SC = "SC", "Santa Catarina"
    SP = "SP", "São Paulo"
    SE = "SE", "Sergipe"
    TO = "TO", "Tocantins"


class TipoSolo(models.TextChoices):
    ARGILOSO = "argiloso", "Argiloso"
    ARENOSO  = "arenoso",  "Arenoso"
    SILTOSO  = "siltoso",  "Siltoso"
    HUMIFERO = "humifero", "Humífero"
    CALCARIO = "calcario", "Calcário"
    LATERITA = "laterita", "Laterita"
    MISTO    = "misto",    "Misto"


class Cultura(models.TextChoices):
    SOJA     = "soja",     "Soja"
    MILHO    = "milho",    "Milho"
    CANA     = "cana",     "Cana-de-açúcar"
    CAFE     = "cafe",     "Café"
    ALGODAO  = "algodao",  "Algodão"
    FEIJAO   = "feijao",   "Feijão"
    TRIGO    = "trigo",    "Trigo"
    SORGO    = "sorgo",    "Sorgo"
    PASTAGEM = "pastagem", "Pastagem"
    OUTRO    = "outro",    "Outro"


class SistemaCultivo(models.TextChoices):
    DIRETO       = "direto",       "Plantio direto"
    CONVENCIONAL = "convencional", "Convencional"
    MINIMO       = "minimo",       "Cultivo mínimo"


class Irrigacao(models.TextChoices):
    SEQUEIRO    = "sequeiro",    "Sequeiro"
    PIVO        = "pivo",        "Pivô central"
    GOTEJAMENTO = "gotejamento", "Gotejamento"
    ASPERSAO    = "aspersao",    "Aspersão"


class Propriedade(models.Model):
    owner      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="propriedades", verbose_name="Proprietário")
    nome       = models.CharField(max_length=150, verbose_name="Nome da fazenda")
    area_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Área total (ha)")
    municipio  = models.CharField(max_length=100, verbose_name="Município")
    uf         = models.CharField(max_length=2, choices=UF.choices, verbose_name="UF")
    latitude   = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="Latitude")
    longitude  = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="Longitude")
    is_active  = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Propriedade"
        verbose_name_plural = "Propriedades"
        ordering            = ["-created_at"]

    def __str__(self):
        return f"{self.nome} ({self.municipio}/{self.uf})"


class Talhao(models.Model):
    propriedade = models.ForeignKey(Propriedade, on_delete=models.CASCADE, related_name="talhoes", verbose_name="Propriedade")

    # Identificação
    nome   = models.CharField(max_length=100, verbose_name="Nome do talhão")
    codigo = models.CharField(max_length=40, blank=True, verbose_name="Código interno")

    # Área e solo
    area          = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Área (ha)")
    area_produtiva = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Área produtiva (ha)")
    declividade   = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name="Declividade (%)")
    tipo_solo     = models.CharField(max_length=20, choices=TipoSolo.choices, verbose_name="Tipo de solo")
    ph_solo       = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, verbose_name="pH (CaCl₂)")

    # Cultura e manejo
    cultura         = models.CharField(max_length=30, choices=Cultura.choices, blank=True, verbose_name="Cultura principal")
    safra           = models.CharField(max_length=10, blank=True, default="2026/2027", verbose_name="Safra")
    sistema_cultivo = models.CharField(max_length=20, choices=SistemaCultivo.choices, default=SistemaCultivo.DIRETO, verbose_name="Sistema de cultivo")
    irrigacao       = models.CharField(max_length=20, choices=Irrigacao.choices, default=Irrigacao.SEQUEIRO, verbose_name="Irrigação")
    pragas_doencas  = models.TextField(blank=True, verbose_name="Pragas e doenças monitoradas")

    # Localização
    latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Latitude")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Longitude")

    # Observações
    observacoes = models.TextField(blank=True, verbose_name="Observações")

    is_active  = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Talhão"
        verbose_name_plural = "Talhões"
        ordering            = ["nome"]
        constraints = [
            models.UniqueConstraint(
                fields=["propriedade", "nome"],
                condition=models.Q(is_active=True),
                name="unique_talhao_ativo_por_propriedade",
            )
        ]

    def __str__(self):
        return f"{self.nome} — {self.propriedade.nome}"