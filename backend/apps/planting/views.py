# apps/planting/views.py
from django.views.generic import ListView, CreateView, DetailView, DeleteView, View
from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import SimulacaoSafra
from .forms import SimulacaoSafraForm

class SimulacaoListView(LoginRequiredMixin, ListView):
    model = SimulacaoSafra
    template_name = "planting/simulacao_list.html"
    context_object_name = "simulacoes"

    def get_queryset(self):
        return SimulacaoSafra.objects.filter(owner=self.request.user)

class SimulacaoCreateView(LoginRequiredMixin, CreateView):
    model = SimulacaoSafra
    form_class = SimulacaoSafraForm
    template_name = "planting/simulacao_form.html"
    success_url = reverse_lazy("web_planting:simulacao_list")

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)

class SimulacaoDetailView(LoginRequiredMixin, DetailView):
    model = SimulacaoSafra
    template_name = "planting/simulacao_detail.html"
    context_object_name = "simulacao"

    def get_queryset(self):
        return SimulacaoSafra.objects.filter(owner=self.request.user)

class SimulacaoDeleteView(LoginRequiredMixin, DeleteView):
    model = SimulacaoSafra
    success_url = reverse_lazy("web_planting:simulacao_list")

    def get_queryset(self):
        return SimulacaoSafra.objects.filter(owner=self.request.user)

    def delete(self, request, *args, **kwargs):
        messages.success(request, "Simulação excluída com sucesso.")
        return super().delete(request, *args, **kwargs)

class SimulacaoBulkDeleteView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        # Exclui todas as simulações do usuário logado
        count, _ = SimulacaoSafra.objects.filter(owner=request.user).delete()
        if count > 0:
            messages.success(request, "Todas as simulações foram excluídas com sucesso.")
        else:
            messages.warning(request, "Nenhuma simulação encontrada para exclusão.")
        return redirect('web_planting:simulacao_list')
