# apps/properties/tests/test_propriedades.py
# Python 3.12+ | Django 5.x | pytest
# Testes do módulo de Propriedades e Talhões — Sprint 02

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from apps.properties.models import Propriedade, Talhao
from apps.properties import services, selectors

User = get_user_model()


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="produtor@agro.com",
        name="Produtor Teste",
        password="Senha@1234",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="outro@agro.com",
        name="Outro User",
        password="Senha@1234",
    )


@pytest.fixture
def propriedade(db, user):
    return services.create_propriedade(
        owner=user,
        nome="Fazenda Boa Vista",
        area_total="250.00",
        municipio="Planaltina",
        uf="GO",
        latitude="-15.456321",
        longitude="-47.654321",
    )


@pytest.fixture
def talhao(db, propriedade):
    return services.create_talhao(
        propriedade=propriedade,
        nome="Talhão A",
        area="50.00",
        tipo_solo="argiloso",
    )


@pytest.fixture
def client_auth(user):
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


# ── Services: Propriedade ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_propriedade_sucesso(user):
    p = services.create_propriedade(
        owner=user,
        nome="Fazenda São João",
        area_total="100.00",
        municipio="Goiânia",
        uf="GO",
        latitude="-16.686",
        longitude="-49.264",
    )
    assert p.pk is not None
    assert p.owner == user
    assert p.is_active is True


@pytest.mark.django_db
def test_deactivate_propriedade(propriedade):
    services.deactivate_propriedade(propriedade=propriedade)
    propriedade.refresh_from_db()
    assert propriedade.is_active is False


@pytest.mark.django_db
def test_update_propriedade(propriedade):
    services.update_propriedade(propriedade=propriedade, nome="Novo Nome")
    propriedade.refresh_from_db()
    assert propriedade.nome == "Novo Nome"


# ── Services: Talhão ──────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_talhao_sucesso(propriedade):
    t = services.create_talhao(
        propriedade=propriedade,
        nome="Talhão B",
        area="30.00",
        tipo_solo="arenoso",
    )
    assert t.pk is not None
    assert t.propriedade == propriedade


@pytest.mark.django_db
def test_create_talhao_em_propriedade_inativa_falha(propriedade):
    services.deactivate_propriedade(propriedade=propriedade)
    with pytest.raises(ValidationError):
        services.create_talhao(
            propriedade=propriedade,
            nome="Talhão Inválido",
            area="10.00",
            tipo_solo="misto",
        )


@pytest.mark.django_db
def test_deactivate_talhao_preserva_registro(talhao):
    talhao_id = talhao.pk
    services.deactivate_talhao(talhao=talhao)
    talhao_db = Talhao.objects.get(pk=talhao_id)
    assert talhao_db.is_active is False


# ── Selectors ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_get_propriedades_by_user_retorna_apenas_do_owner(user, other_user, propriedade):
    services.create_propriedade(
        owner=other_user,
        nome="Fazenda Alheia",
        area_total="50.00",
        municipio="Brasília",
        uf="DF",
        latitude="-15.780",
        longitude="-47.929",
    )
    resultado = selectors.get_propriedades_by_user(user=user)
    assert all(p.owner == user for p in resultado)


@pytest.mark.django_db
def test_get_propriedade_por_id_de_outro_user_falha(propriedade, other_user):
    with pytest.raises(Propriedade.DoesNotExist):
        selectors.get_propriedade_by_id(propriedade_id=propriedade.pk, user=other_user)


# ── API ───────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_api_lista_propriedades(client_auth, propriedade):
    response = client_auth.get("/api/propriedades/")
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_api_cria_propriedade(client_auth):
    payload = {
        "nome": "Fazenda Nova",
        "area_total": "180.50",
        "municipio": "Formosa",
        "uf": "GO",
        "latitude": "-15.532",
        "longitude": "-47.334",
    }
    response = client_auth.post("/api/propriedades/", payload, format="json")
    assert response.status_code == 201
    assert response.data["nome"] == "Fazenda Nova"


@pytest.mark.django_db
def test_api_inativa_propriedade(client_auth, propriedade):
    response = client_auth.delete(f"/api/propriedades/{propriedade.pk}/")
    assert response.status_code == 204
    propriedade.refresh_from_db()
    assert propriedade.is_active is False


@pytest.mark.django_db
def test_api_cria_talhao(client_auth, propriedade):
    payload = {
        "nome": "Talhão Norte",
        "area": "45.00",
        "tipo_solo": "argiloso",
    }
    response = client_auth.post(
        f"/api/propriedades/{propriedade.pk}/talhoes/", payload, format="json"
    )
    assert response.status_code == 201
    assert response.data["nome"] == "Talhão Norte"


# ── Isolamento entre usuários (RBAC / Ownership) ─────────────────────────────

@pytest.mark.django_db
def test_api_usuario_nao_ve_propriedade_de_outro(other_user, propriedade):
    """Um usuário autenticado NÃO deve ver propriedades de outro owner."""
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(other_user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    response = client.get("/api/propriedades/")
    assert response.status_code == 200
    assert len(response.data) == 0  # other_user não tem propriedades


@pytest.mark.django_db
def test_api_usuario_nao_acessa_detalhe_de_outro(other_user, propriedade):
    """Um usuário NÃO deve conseguir acessar o detalhe de propriedade alheia."""
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(other_user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    response = client.get(f"/api/propriedades/{propriedade.pk}/")
    assert response.status_code == 404


@pytest.mark.django_db
def test_api_usuario_nao_deleta_propriedade_de_outro(other_user, propriedade):
    """Um usuário NÃO deve conseguir inativar propriedade de outro owner."""
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(other_user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    response = client.delete(f"/api/propriedades/{propriedade.pk}/")
    assert response.status_code == 404
    propriedade.refresh_from_db()
    assert propriedade.is_active is True  # não foi inativada


@pytest.mark.django_db
def test_api_usuario_nao_cria_talhao_em_propriedade_de_outro(other_user, propriedade):
    """Um usuário NÃO deve conseguir criar talhão em propriedade alheia."""
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(other_user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    payload = {"nome": "Talhão Intruso", "area": "20.00", "tipo_solo": "argiloso"}
    response = client.post(
        f"/api/propriedades/{propriedade.pk}/talhoes/", payload, format="json"
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_api_sem_autenticacao_retorna_401():
    """Endpoints protegidos devem retornar 401 sem token."""
    client = APIClient()
    response = client.get("/api/propriedades/")
    assert response.status_code == 401
