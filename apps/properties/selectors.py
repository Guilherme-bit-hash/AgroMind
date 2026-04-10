# apps/properties/selectors.py
from django.db.models import QuerySet
from .models import Propriedade, Talhao


def get_propriedades_by_user(*, user) -> QuerySet[Propriedade]:
    return Propriedade.objects.filter(owner=user, is_active=True)


def get_propriedade_by_id(*, propriedade_id: int, user) -> Propriedade:
    return Propriedade.objects.get(
        id=propriedade_id,
        owner=user,
        is_active=True,
    )


def get_talhoes_by_propriedade(
    *, propriedade: Propriedade, apenas_ativos: bool = True
) -> QuerySet[Talhao]:
    qs = Talhao.objects.filter(propriedade=propriedade)
    if apenas_ativos:
        qs = qs.filter(is_active=True)
    return qs


def get_talhao_by_id(*, talhao_id: int, user) -> Talhao:
    return Talhao.objects.get(
        id=talhao_id,
        propriedade__owner=user,
        propriedade__is_active=True,
        is_active=True,
    )