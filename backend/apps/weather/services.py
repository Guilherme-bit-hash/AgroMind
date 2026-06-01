import requests
from apps.properties.models import Cultura

class OpenMeteoService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @classmethod
    def get_forecast(cls, latitude: float, longitude: float, cultura: Cultura):
        """
        Retorna a previsão de 10 dias e o resumo da classificação das janelas de plantio
        com base na cultura associada ao talhão.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto",
            "forecast_days": 10
        }
        
        try:
            response = requests.get(cls.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            raise Exception(f"Erro ao consultar a API Open-Meteo: {str(e)}")

        daily = data.get("daily", {})
        times = daily.get("time", [])
        temp_max = daily.get("temperature_2m_max", [])
        temp_min = daily.get("temperature_2m_min", [])
        precip = daily.get("precipitation_sum", [])

        forecast_list = []
        verde_count = 0
        amarelo_count = 0
        vermelho_count = 0

        for i in range(len(times)):
            t_max = temp_max[i] if len(temp_max) > i else 0
            t_min = temp_min[i] if len(temp_min) > i else 0
            rain = precip[i] if len(precip) > i else 0
            date_str = times[i] if len(times) > i else ""

            is_red = False
            alert_msg = ""
            
            # Condições críticas (VERMELHO)
            if rain >= (cultura.chuva_max_diaria * 2):
                is_red = True
                alert_msg = "Chuva severa"
            elif t_min <= cultura.temp_critica_geada:
                is_red = True
                alert_msg = "Risco de geada"
            elif t_max > (cultura.temp_max_ideal + 10.0): # Tolerância arbitrária para calor extremo
                is_red = True
                alert_msg = "Calor extremo"
            
            if is_red:
                color = "vermelho"
                vermelho_count += 1
            else:
                # Condições ideais (VERDE)
                if (cultura.temp_min_ideal <= t_min <= cultura.temp_max_ideal) and \
                   (cultura.temp_min_ideal <= t_max <= cultura.temp_max_ideal) and \
                   (rain < cultura.chuva_max_diaria):
                    color = "verde"
                    alert_msg = "Condições ideais de plantio"
                    verde_count += 1
                # Condições intermediárias (AMARELO)
                else:
                    color = "amarelo"
                    alert_msg = "Atenção - Condições fora da faixa ideal"
                    amarelo_count += 1

            forecast_list.append({
                "date": date_str,
                "temperature_min": t_min,
                "temperature_max": t_max,
                "precipitation": rain,
                "classification": color,
                "alert": alert_msg
            })

        summary = {
            "verde": verde_count,
            "amarelo": amarelo_count,
            "vermelho": vermelho_count
        }

        return forecast_list, summary
