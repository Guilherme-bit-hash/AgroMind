from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.properties.selectors import get_talhao_by_id_any_status
from .services import OpenMeteoService
from .models import WeatherHistory

class WeatherForecastView(APIView):
    """
    Consulta previsão do tempo por latitude e longitude via Open-Meteo,
    calcula a janela ideal de plantio e salva histórico.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, talhao_id: int) -> Response:
        try:
            talhao = get_talhao_by_id_any_status(talhao_id=talhao_id, user=request.user)
        except Exception:
            return Response({"detail": "Talhão não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if not talhao.latitude or not talhao.longitude:
            return Response(
                {"detail": "O talhão não possui latitude e longitude cadastradas."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not talhao.cultura:
            return Response(
                {"detail": "O talhão não possui cultura associada para avaliar limites climáticos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            forecast_list, summary = OpenMeteoService.get_forecast(
                latitude=float(talhao.latitude),
                longitude=float(talhao.longitude),
                cultura=talhao.cultura
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # Salvar o histórico da consulta
        WeatherHistory.objects.create(
            plot=talhao,
            classification_summary=summary
        )

        return Response({
            "talhao": talhao.nome,
            "summary": summary,
            "forecast": forecast_list
        }, status=status.HTTP_200_OK)
