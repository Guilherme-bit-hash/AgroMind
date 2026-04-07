# apps/properties/web_views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required
def propriedades_list_view(request):
    """Renderiza a listagem web de propriedades (Frontend)."""
    return render(request, "properties/propriedades_list.html", {"user": request.user})

@login_required
def propriedade_detail_view(request, propriedade_id):
    """Renderiza a página de detalhes de uma propriedade e seus talhões."""
    return render(request, "properties/propriedades_detail.html", {
        "user": request.user,
        "propriedade_id": propriedade_id
    })
