# apps/bolsa/views.py
from datetime import datetime

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.core.cache import cache

# Commodities exibidas: (slug, nome, emoji, ticker do Yahoo Finance / futuros)
#   ZS=F Soja | ZC=F Milho | ZW=F Trigo | KC=F Café | CT=F Algodão | SB=F Açúcar | LE=F Boi (CME)
COMMODITIES = [
    ("soja",    "Soja",            "\U0001F331", "ZS=F"),
    ("milho",   "Milho",           "\U0001F33D", "ZC=F"),
    ("trigo",   "Trigo",           "\U0001F33E", "ZW=F"),
    ("cafe",    "Caf\u00e9",       "\u2615",     "KC=F"),
    ("algodao", "Algod\u00e3o",    "\U0001F9F5", "CT=F"),
    ("acucar",  "A\u00e7\u00facar","\U0001F9C2", "SB=F"),
    ("boi",     "Boi Gordo (CME)", "\U0001F402", "LE=F"),
]

CACHE_KEY = "bolsa_agro_cotacoes_v1"
CACHE_TTL = 60 * 30  # 30 minutos


def _fmt_br(valor, casas=2):
    """Formata número no padrão brasileiro: 1.234.567,89."""
    if valor is None:
        return "\u2014"  # travessão
    s = f"{valor:,.{casas}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def _sparkline(closes):
    """Gera os pontos de uma polyline (viewBox 0..80 x 0..30) a partir da série de preços."""
    pts = closes[-20:] if len(closes) > 20 else closes
    if len(pts) < 2:
        return "0,15 80,15"
    lo, hi = min(pts), max(pts)
    span = (hi - lo) or 1
    n = len(pts)
    coords = []
    for i, v in enumerate(pts):
        x = round(i * 80 / (n - 1), 1)
        y = round(28 - ((v - lo) / span) * 24, 1)  # 28 (base) -> 4 (topo)
        coords.append(f"{x},{y}")
    return " ".join(coords)


def _placeholder(slug, nome, emoji, ticker):
    return {
        "slug": slug, "nome": nome, "emoji": emoji, "ticker": ticker,
        "preco": "\u2014", "variacao": "\u2014", "subindo": True,
        "maxima": "\u2014", "minima": "\u2014", "volume": "\u2014",
        "sparkline": "0,15 80,15", "cor": "#7ab07a",
    }


def _buscar_cotacoes():
    """Busca futuros via yfinance e converte USD->BRL (indicativo). Tolerante a falhas."""
    resultado = {"linhas": [], "usdbrl": None, "erro": None, "tem_dados": False}

    try:
        import yfinance as yf
    except Exception:
        resultado["erro"] = "Biblioteca de cotações (yfinance) não instalada."
        resultado["linhas"] = [_placeholder(*c) for c in COMMODITIES]
        return resultado

    # Câmbio USD -> BRL
    usdbrl = None
    try:
        fx = yf.Ticker("USDBRL=X").history(period="5d", interval="1d")
        if not fx.empty:
            usdbrl = float(fx["Close"].dropna().iloc[-1])
    except Exception:
        usdbrl = None
    resultado["usdbrl"] = usdbrl
    fator = usdbrl if usdbrl else 1.0

    for slug, nome, emoji, ticker in COMMODITIES:
        linha = _placeholder(slug, nome, emoji, ticker)
        try:
            hist = yf.Ticker(ticker).history(period="1y", interval="1d")
            closes = hist["Close"].dropna().tolist()
            if closes:
                preco = closes[-1]
                prev = closes[-2] if len(closes) > 1 else preco
                var = ((preco - prev) / prev * 100) if prev else 0.0
                subindo = var >= 0
                high = float(hist["High"].max())
                low = float(hist["Low"].min())
                vol_series = hist["Volume"].dropna()
                volume = int(vol_series.iloc[-1]) if not vol_series.empty else None
                linha.update({
                    "preco": _fmt_br(preco * fator),
                    "variacao": f"{'+' if subindo else ''}{var:.1f}%",
                    "subindo": subindo,
                    "maxima": _fmt_br(high * fator),
                    "minima": _fmt_br(low * fator),
                    "volume": _fmt_br(volume, casas=0) if volume is not None else "\u2014",
                    "sparkline": _sparkline(closes),
                    "cor": "#2d6a2d" if subindo else "#c0392b",
                })
                resultado["tem_dados"] = True
        except Exception:
            pass  # mantém o placeholder "—" para esta linha
        resultado["linhas"].append(linha)

    return resultado


@login_required
def bolsa_agro(request):
    dados = cache.get(CACHE_KEY)
    if dados is None:
        dados = _buscar_cotacoes()
        # Só cacheia se realmente veio cotação (evita "prender" uma falha temporária por 30 min)
        if dados.get("tem_dados"):
            cache.set(CACHE_KEY, dados, CACHE_TTL)

    contexto = {
        "commodities": dados["linhas"],
        "usdbrl": _fmt_br(dados["usdbrl"]) if dados.get("usdbrl") else None,
        "erro": dados.get("erro"),
        "atualizado_em": datetime.now().strftime("%d/%m/%Y %H:%M"),
    }
    return render(request, "bolsa/bolsa_agro.html", contexto)
