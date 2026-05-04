# apps/properties/services.py
from decimal import Decimal
from django.core.exceptions import ValidationError
from .models import Propriedade, Talhao


# ── Propriedade ───────────────────────────────────────────────────────────────

def create_propriedade(*, owner, nome, area_total, municipio, uf, latitude, longitude) -> Propriedade:
    propriedade = Propriedade(owner=owner, nome=nome, area_total=area_total,
                               municipio=municipio, uf=uf, latitude=latitude, longitude=longitude)
    propriedade.full_clean()
    propriedade.save()
    return propriedade


def update_propriedade(*, propriedade: Propriedade, **fields) -> Propriedade:
    allowed = {"nome", "area_total", "municipio", "uf", "latitude", "longitude"}
    for field, value in fields.items():
        if field not in allowed:
            raise ValidationError(f"Campo '{field}' não pode ser atualizado por aqui.")
        setattr(propriedade, field, value)
    propriedade.full_clean()
    propriedade.save(update_fields=list(fields.keys()) + ["updated_at"])
    return propriedade


def deactivate_propriedade(*, propriedade: Propriedade) -> Propriedade:
    propriedade.is_active = False
    propriedade.save(update_fields=["is_active", "updated_at"])
    return propriedade


def toggle_propriedade_status(*, propriedade: Propriedade) -> Propriedade:
    """Alterna o campo is_active entre True e False."""
    propriedade.is_active = not propriedade.is_active
    propriedade.save(update_fields=["is_active", "updated_at"])
    return propriedade


# ── Talhão ────────────────────────────────────────────────────────────────────

def create_talhao(
    *,
    propriedade: Propriedade,
    nome: str,
    area: Decimal,
    tipo_solo: str,
    codigo: str = "",
    area_produtiva: Decimal | None = None,
    declividade: Decimal | None = None,
    ph_solo: Decimal | None = None,
    cultura: str = "",
    safra: str = "2026/2027",
    sistema_cultivo: str = "direto",
    irrigacao: str = "sequeiro",
    pragas_doencas: str = "",
    observacoes: str = "",
    latitude: Decimal | None = None,
    longitude: Decimal | None = None,
) -> Talhao:
    if not propriedade.is_active:
        raise ValidationError("Não é possível cadastrar talhões em uma propriedade inativa.")

    talhao = Talhao(
        propriedade=propriedade,
        nome=nome,
        codigo=codigo,
        area=area,
        area_produtiva=area_produtiva,
        declividade=declividade,
        tipo_solo=tipo_solo,
        ph_solo=ph_solo,
        cultura=cultura,
        safra=safra,
        sistema_cultivo=sistema_cultivo,
        irrigacao=irrigacao,
        pragas_doencas=pragas_doencas,
        observacoes=observacoes,
        latitude=latitude,
        longitude=longitude,
    )
    talhao.full_clean()
    talhao.save()
    return talhao


def update_talhao(*, talhao: Talhao, **fields) -> Talhao:
    allowed = {
        "nome", "codigo", "area", "area_produtiva", "declividade",
        "tipo_solo", "ph_solo", "cultura", "safra",
        "sistema_cultivo", "irrigacao", "pragas_doencas", "observacoes",
        "latitude", "longitude",
    }
    for field, value in fields.items():
        if field not in allowed:
            raise ValidationError(f"Campo '{field}' não pode ser atualizado aqui.")
        setattr(talhao, field, value)
    talhao.full_clean()
    talhao.save(update_fields=list(fields.keys()) + ["updated_at"])
    return talhao


def deactivate_talhao(*, talhao: Talhao) -> Talhao:
    talhao.is_active = False
    talhao.save(update_fields=["is_active", "updated_at"])
    return talhao


def toggle_talhao_status(*, talhao: Talhao) -> Talhao:
    """Alterna o campo is_active entre True e False."""
    talhao.is_active = not talhao.is_active
    talhao.save(update_fields=["is_active", "updated_at"])
    return talhao