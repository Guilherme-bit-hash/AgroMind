# apps/properties/services.py
# Python 3.12+ | Django 5.x
# Camada de serviços — regras de negócio para Propriedade e Talhão.

from decimal import Decimal
from django.core.exceptions import ValidationError
from .models import Propriedade, Talhao


# ── Propriedade ───────────────────────────────────────────────────────────────

def create_propriedade(
    *,
    owner,
    nome: str,
    area_total: Decimal,
    municipio: str,
    uf: str,
    latitude: Decimal,
    longitude: Decimal,
) -> Propriedade:
    """Cria uma nova propriedade vinculada ao usuário autenticado."""
    propriedade = Propriedade(
        owner=owner,
        nome=nome,
        area_total=area_total,
        municipio=municipio,
        uf=uf,
        latitude=latitude,
        longitude=longitude,
    )
    propriedade.full_clean()
    propriedade.save()
    return propriedade


def update_propriedade(*, propriedade: Propriedade, **fields) -> Propriedade:
    """Atualiza campos permitidos de uma propriedade existente."""
    allowed_fields = {"nome", "area_total", "municipio", "uf", "latitude", "longitude"}
    for field, value in fields.items():
        if field not in allowed_fields:
            raise ValidationError(f"Campo '{field}' não pode ser atualizado por aqui.")
        setattr(propriedade, field, value)
    propriedade.full_clean()
    propriedade.save(update_fields=list(fields.keys()) + ["updated_at"])
    return propriedade


def deactivate_propriedade(*, propriedade: Propriedade) -> Propriedade:
    """Inativa uma propriedade sem excluir o histórico."""
    propriedade.is_active = False
    propriedade.save(update_fields=["is_active", "updated_at"])
    return propriedade


# ── Talhão ────────────────────────────────────────────────────────────────────

def create_talhao(
    *,
    propriedade: Propriedade,
    nome: str,
    area: Decimal,
    tipo_solo: str,
    latitude: Decimal | None = None,
    longitude: Decimal | None = None,
) -> Talhao:
    """
    Cria um talhão vinculado a uma propriedade.
    Valida que a propriedade está ativa antes de aceitar o cadastro.
    """
    if not propriedade.is_active:
        raise ValidationError("Não é possível cadastrar talhões em uma propriedade inativa.")

    talhao = Talhao(
        propriedade=propriedade,
        nome=nome,
        area=area,
        tipo_solo=tipo_solo,
        latitude=latitude,
        longitude=longitude,
    )
    talhao.full_clean()
    talhao.save()
    return talhao


def update_talhao(*, talhao: Talhao, **fields) -> Talhao:
    """Atualiza campos de um talhão existente."""
    allowed_fields = {"nome", "area", "tipo_solo", "latitude", "longitude"}
    for field, value in fields.items():
        if field not in allowed_fields:
            raise ValidationError(f"Campo '{field}' não pode ser atualizado aqui.")
        setattr(talhao, field, value)
    talhao.full_clean()
    talhao.save(update_fields=list(fields.keys()) + ["updated_at"])
    return talhao


def deactivate_talhao(*, talhao: Talhao) -> Talhao:
    """Inativa um talhão preservando o histórico vinculado (RF-10)."""
    talhao.is_active = False
    talhao.save(update_fields=["is_active", "updated_at"])
    return talhao
