# apps/properties/views.py
# Python 3.12+ | Django 5.x | DRF
# Views para CRUD de Propriedade e Talhão — todas protegidas por JWT.

from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import selectors, services
from .serializers import (
    PropriedadeCreateSerializer,
    PropriedadeSerializer,
    PropriedadeUpdateSerializer,
    TalhaoCreateSerializer,
    TalhaoSerializer,
    TalhaoUpdateSerializer,
)


# ── Propriedades ─────────────────────────────────────────────────────────────

class PropriedadeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """Lista todas as propriedades ativas do usuário autenticado."""
        propriedades = selectors.get_propriedades_by_user(user=request.user)
        serializer = PropriedadeSerializer(propriedades, many=True)
        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        """Cadastra uma nova propriedade para o usuário autenticado."""
        serializer = PropriedadeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            propriedade = services.create_propriedade(
                owner=request.user, **serializer.validated_data
            )
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            PropriedadeSerializer(propriedade).data,
            status=status.HTTP_201_CREATED,
        )


class PropriedadeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_propriedade_or_404(self, propriedade_id: int, user):
        try:
            return selectors.get_propriedade_by_id(propriedade_id=propriedade_id, user=user)
        except Exception:
            return None

    def get(self, request: Request, propriedade_id: int) -> Response:
        propriedade = self._get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response({"detail": "Propriedade não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        return Response(PropriedadeSerializer(propriedade).data)

    def patch(self, request: Request, propriedade_id: int) -> Response:
        propriedade = self._get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response({"detail": "Propriedade não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PropriedadeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            propriedade = services.update_propriedade(
                propriedade=propriedade, **serializer.validated_data
            )
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PropriedadeSerializer(propriedade).data)

    def delete(self, request: Request, propriedade_id: int) -> Response:
        """Inativa a propriedade (soft delete)."""
        propriedade = self._get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response({"detail": "Propriedade não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        services.deactivate_propriedade(propriedade=propriedade)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Talhões ───────────────────────────────────────────────────────────────────

class TalhaoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_propriedade_or_404(self, propriedade_id: int, user):
        try:
            return selectors.get_propriedade_by_id(propriedade_id=propriedade_id, user=user)
        except Exception:
            return None

    def get(self, request: Request, propriedade_id: int) -> Response:
        propriedade = self._get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response({"detail": "Propriedade não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        talhoes = selectors.get_talhoes_by_propriedade(propriedade=propriedade)
        return Response(TalhaoSerializer(talhoes, many=True).data)

    def post(self, request: Request, propriedade_id: int) -> Response:
        propriedade = self._get_propriedade_or_404(propriedade_id, request.user)
        if not propriedade:
            return Response({"detail": "Propriedade não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TalhaoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            talhao = services.create_talhao(propriedade=propriedade, **serializer.validated_data)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TalhaoSerializer(talhao).data, status=status.HTTP_201_CREATED)


class TalhaoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_talhao_or_404(self, talhao_id: int, user):
        try:
            return selectors.get_talhao_by_id(talhao_id=talhao_id, user=user)
        except Exception:
            return None

    def get(self, request: Request, talhao_id: int) -> Response:
        talhao = self._get_talhao_or_404(talhao_id, request.user)
        if not talhao:
            return Response({"detail": "Talhão não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TalhaoSerializer(talhao).data)

    def patch(self, request: Request, talhao_id: int) -> Response:
        talhao = self._get_talhao_or_404(talhao_id, request.user)
        if not talhao:
            return Response({"detail": "Talhão não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TalhaoUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            talhao = services.update_talhao(talhao=talhao, **serializer.validated_data)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TalhaoSerializer(talhao).data)

    def delete(self, request: Request, talhao_id: int) -> Response:
        """Inativa o talhão sem apagar o histórico (RF-10)."""
        talhao = self._get_talhao_or_404(talhao_id, request.user)
        if not talhao:
            return Response({"detail": "Talhão não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        services.deactivate_talhao(talhao=talhao)
        return Response(status=status.HTTP_204_NO_CONTENT)
