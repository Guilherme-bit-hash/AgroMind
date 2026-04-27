# apps/estoque/views.py
# Python 3.12+ | Django 5.x
# Views do módulo de Estoque de Insumos — Sprint 03

from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.properties.selectors import get_propriedade_by_id

from . import selectors, services
from .serializers import (
    InsumoCreateSerializer,
    InsumoSerializer,
    InsumoUpdateSerializer,
    EntradaEstoqueCreateSerializer,
    EntradaEstoqueSerializer,
    SaidaEstoqueCreateSerializer,
    SaidaEstoqueSerializer,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_propriedade_or_404(propriedade_id: int, user):
    """Busca propriedade do owner ou retorna None."""
    try:
        return get_propriedade_by_id(propriedade_id=propriedade_id, user=user)
    except Exception:
        return None


def _get_insumo_or_404(insumo_id: int, owner):
    """Busca insumo ativo do owner ou retorna None."""
    try:
        return selectors.get_insumo_by_id(owner=owner, insumo_id=insumo_id)
    except Exception:
        return None


# ── Insumo CRUD (RF-39) ─────────────────────────────────────────────────────

class InsumoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, propriedade_id: int) -> Response:
        propriedade = _get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response(
                {"detail": "Propriedade não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        insumos = selectors.get_insumos_by_propriedade(
            owner=request.user, propriedade_id=propriedade_id,
        )
        return Response(InsumoSerializer(insumos, many=True).data)

    def post(self, request: Request, propriedade_id: int) -> Response:
        propriedade = _get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response(
                {"detail": "Propriedade não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InsumoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            insumo = services.create_insumo(
                owner=request.user,
                propriedade_id=propriedade_id,
                **serializer.validated_data,
            )
        except ValidationError as e:
            return Response(
                {"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            InsumoSerializer(insumo).data,
            status=status.HTTP_201_CREATED,
        )


class InsumoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(InsumoSerializer(insumo).data)

    def patch(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InsumoUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            insumo = services.update_insumo(
                insumo=insumo, **serializer.validated_data,
            )
        except ValidationError as e:
            return Response(
                {"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(InsumoSerializer(insumo).data)

    def delete(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        services.deactivate_insumo(insumo=insumo)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── EntradaEstoque (RF-40, RF-43) ───────────────────────────────────────────

class EntradaEstoqueListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        entradas = selectors.get_entradas_by_insumo(insumo=insumo)
        return Response(EntradaEstoqueSerializer(entradas, many=True).data)

    def post(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EntradaEstoqueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            entrada = services.registrar_entrada(
                owner=request.user,
                insumo_id=insumo_id,
                **serializer.validated_data,
            )
        except ValidationError as e:
            return Response(
                {"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            EntradaEstoqueSerializer(entrada).data,
            status=status.HTTP_201_CREATED,
        )


# ── SaidaEstoque (RF-41, RF-42, RF-43, RF-44) ───────────────────────────────

class SaidaEstoqueListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        saidas = selectors.get_saidas_by_insumo(insumo=insumo)
        return Response(SaidaEstoqueSerializer(saidas, many=True).data)

    def post(self, request: Request, propriedade_id: int, insumo_id: int) -> Response:
        insumo = _get_insumo_or_404(insumo_id, request.user)
        if not insumo or insumo.propriedade_id != propriedade_id:
            return Response(
                {"detail": "Insumo não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SaidaEstoqueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            saida = services.registrar_saida(
                owner=request.user,
                insumo_id=insumo_id,
                **serializer.validated_data,
            )
        except ValidationError as e:
            return Response(
                {"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            SaidaEstoqueSerializer(saida).data,
            status=status.HTTP_201_CREATED,
        )


# ── Alertas de Estoque Mínimo (RF-42) ───────────────────────────────────────

class AlertaEstoqueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, propriedade_id: int) -> Response:
        propriedade = _get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response(
                {"detail": "Propriedade não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        insumos = selectors.get_insumos_abaixo_estoque_minimo(
            owner=request.user, propriedade_id=propriedade_id,
        )
        return Response(InsumoSerializer(insumos, many=True).data)
