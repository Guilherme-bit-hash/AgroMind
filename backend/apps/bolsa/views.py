from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def bolsa_agro(request):
    return render(request, "bolsa/bolsa_agro.html")
