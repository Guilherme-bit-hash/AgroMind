// js/dashboard.js
// Dashboard - Integração com Backend Spring Boot

// ============================================================
//  INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    await carregarDashboard();
});

// ============================================================
//  CARREGAR DADOS DO DASHBOARD
// ============================================================

async function carregarDashboard() {
    try {
        // Buscar todos os dados em paralelo
        const [clientes, produtos, vendas, faturamento, vendasMensais] = await Promise.all([
            apiClientes.listar(),
            apiProdutos.listar(),
            apiVendas.listar(),
            apiVendas.totalFaturamento(),
            apiVendas.vendasPorMes()
        ]);

        // Atualizar cards
        document.getElementById('totalClientes').textContent = clientes.length;
        document.getElementById('totalProdutos').textContent = produtos.length;
        document.getElementById('totalVendas').textContent = vendas.length;
        document.getElementById('totalFaturamento').textContent = 
            `R$ ${faturamento.toFixed(2).replace('.', ',')}`;

        // Renderizar gráfico
        renderizarGrafico(vendasMensais);

        // Carregar últimas atividades
        await carregarUltimasAtividades();

    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
        mostrarToast('Erro ao carregar dados do dashboard', 'danger');
    }
}

// ============================================================
//  RENDERIZAR GRÁFICO (Chart.js)
// ============================================================

function renderizarGrafico(dados) {
    const ctx = document.getElementById('graficoVendas');
    if (!ctx) return;

    // Se já existe um gráfico, destruir
    if (window.graficoVendas) {
        window.graficoVendas.destroy();
    }

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Preencher dados para todos os meses
    const dadosMensais = meses.map((_, index) => {
        const mes = dados.find(d => d.mes === index + 1);
        return mes ? mes.total : 0;
    });

    window.graficoVendas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Vendas (R$)',
                data: dadosMensais,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#9CA3AF',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9CA3AF',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2).replace('.', ',');
                        }
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9CA3AF'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================================
//  CARREGAR ÚLTIMAS ATIVIDADES
// ============================================================

async function carregarUltimasAtividades() {
    try {
        const atividades = await apiVendas.ultimasAtividades(5);
        const lista = document.querySelector('.list-group');

        if (!lista) return;

        if (!atividades || atividades.length === 0) {
            lista.innerHTML = `
                <li class="list-group-item text-muted text-center">
                    Nenhuma atividade recente
                </li>
            `;
            return;
        }

        lista.innerHTML = atividades.map(atividade => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${atividade.descricao}</span>
                <small class="text-muted">${formatarData(atividade.data)}</small>
            </li>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar últimas atividades:', error);
    }
}

// ============================================================
//  UTILITÁRIOS
// ============================================================

function formatarData(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}