# apps/properties/selectors.py
# Python 3.12+ | Django 5.x
# Camada de seletores — queries de leitura filtradas por owner.

from django.db.models import QuerySet
from .models import Propriedade, Talhao


def get_propriedades_by_user(*, user) -> QuerySet[Propriedade]:
    """Retorna todas as propriedades ativas do usuário autenticado."""
    return Propriedade.objects.filter(owner=user, is_active=True)


def get_propriedade_by_id(*, propriedade_id: int, user) -> Propriedade:
    """
    Retorna uma propriedade pelo ID, garantindo que pertence ao usuário.
    Lança DoesNotExist se não encontrar ou se não pertencer ao user.
    """
    return Propriedade.objects.get(id=propriedade_id, owner=user, is_active=True)


def get_talhoes_by_propriedade(
    *, propriedade: Propriedade, apenas_ativos: bool = True
) -> QuerySet[Talhao]:
    """Retorna talhões de uma propriedade. Por padrão, apenas os ativos."""
    qs = Talhao.objects.filter(propriedade=propriedade)
    if apenas_ativos:
        qs = qs.filter(is_active=True)
    return qs


def get_talhao_by_id(*, talhao_id: int, user) -> Talhao:
    """
    Retorna um talhão pelo ID, garantindo que a propriedade pai pertence ao usuário.
    """
    return Talhao.objects.get(
        id=talhao_id,
        propriedade__owner=user,
        propriedade__is_active=True,
    )
