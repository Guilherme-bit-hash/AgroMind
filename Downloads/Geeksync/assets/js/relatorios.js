// js/relatorios.js
// Relatórios - Integração com Backend Spring Boot
// Responsável: Integrante A

// ============================================================
//  ESTADO
// ============================================================

let relatorioAtual = null;
let graficoRelatorio = null;

const CATEGORIAS = {
    MANGA: 'Mangá',
    LIVRO_FICCAO: 'Ficção Científica',
    ACTION_FIGURE: 'Action Figure',
    JOGO_TABULEIRO: 'Jogo de Tabuleiro'
};

// ============================================================
//  INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    configurarEventListeners();
    carregarResumoRapido();
    carregarSelectClientes();
});

function configurarEventListeners() {
    // Botão gerar relatório por período
    const btnPeriodo = document.getElementById('btnGerarPeriodo');
    if (btnPeriodo) {
        btnPeriodo.addEventListener('click', gerarRelatorioPeriodo);
    }

    // Botão gerar relatório por cliente
    const btnCliente = document.getElementById('btnGerarCliente');
    if (btnCliente) {
        btnCliente.addEventListener('click', gerarRelatorioCliente);
    }

    // Botão gerar relatório de estoque baixo
    const btnEstoque = document.getElementById('btnGerarEstoque');
    if (btnEstoque) {
        btnEstoque.addEventListener('click', gerarRelatorioEstoqueBaixo);
    }

    // Botão gerar relatório de produtos mais vendidos
    const btnMaisVendidos = document.getElementById('btnGerarMaisVendidos');
    if (btnMaisVendidos) {
        btnMaisVendidos.addEventListener('click', gerarRelatorioMaisVendidos);
    }

    // Botão limpar relatório
    const btnLimpar = document.getElementById('btnLimparRelatorio');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparRelatorio);
    }
}

// ============================================================
//  CARREGAR SELECT DE CLIENTES
// ============================================================

async function carregarSelectClientes() {
    try {
        const clientes = await apiClientes.listar();
        const select = document.getElementById('clienteRelatorio');
        if (!select) return;

        select.innerHTML = `
            <option value="">Selecione um cliente...</option>
            ${clientes.filter(c => c.ativo).map(c => `
                <option value="${c.id}">${c.nome} - ${c.cpf}</option>
            `).join('')}
        `;

    } catch (error) {
        console.error('❌ Erro ao carregar clientes:', error);
    }
}

// ============================================================
//  RESUMO RÁPIDO (cards)
// ============================================================

async function carregarResumoRapido() {
    try {
        const [totalVendas, totalFaturamento, totalClientes, totalProdutos] = await Promise.all([
            apiVendas.listar(),
            apiVendas.totalFaturamento(),
            apiClientes.listar(),
            apiProdutos.listar()
        ]);

        const resumoVendas = document.getElementById('resumoVendas');
        const resumoFaturamento = document.getElementById('resumoFaturamento');
        const resumoClientes = document.getElementById('resumoClientes');
        const resumoProdutos = document.getElementById('resumoProdutos');

        if (resumoVendas) resumoVendas.textContent = totalVendas.length;
        if (resumoFaturamento) resumoFaturamento.textContent = `R$ ${totalFaturamento.toFixed(2).replace('.', ',')}`;
        if (resumoClientes) resumoClientes.textContent = totalClientes.length;
        if (resumoProdutos) resumoProdutos.textContent = totalProdutos.length;

    } catch (error) {
        console.error('❌ Erro ao carregar resumo:', error);
    }
}

// ============================================================
//  RELATÓRIO POR PERÍODO
// ============================================================

async function gerarRelatorioPeriodo() {
    const dataInicio = document.getElementById('dataInicio')?.value;
    const dataFim = document.getElementById('dataFim')?.value;

    if (!dataInicio || !dataFim) {
        mostrarToast('Selecione as datas inicial e final', 'warning');
        return;
    }

    try {
        const response = await api.get(ENDPOINTS.relatorios.vendasPeriodo, {
            params: { inicio: dataInicio, fim: dataFim }
        });

        const dados = response.data;
        exibirRelatorioPeriodo(dados);

    } catch (error) {
        console.error('❌ Erro ao gerar relatório por período:', error);
        mostrarToast('Erro ao gerar relatório', 'danger');
    }
}

function exibirRelatorioPeriodo(dados) {
    const container = document.getElementById('resultadoRelatorio');
    if (!container) return;

    if (!dados || dados.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p>Nenhuma venda encontrada no período selecionado</p>
            </div>
        `;
        return;
    }

    const totalVendas = dados.length;
    const totalValor = dados.reduce((sum, v) => sum + v.total, 0);
    const produtosMaisVendidos = calcularProdutosMaisVendidos(dados);

    container.innerHTML = `
        <!-- Cards de resumo -->
        <div class="dashboard-grid" style="margin-bottom:16px;">
            <div class="dashboard-card">
                <div class="card-header-dash">
                    <div>
                        <div class="card-label">Total de Vendas</div>
                        <div class="card-value">${totalVendas}</div>
                    </div>
                    <i class="bi bi-cart-check card-icon blue"></i>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-header-dash">
                    <div>
                        <div class="card-label">Valor Total</div>
                        <div class="card-value" style="color:var(--success);">
                            R$ ${totalValor.toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                    <i class="bi bi-currency-dollar card-icon green"></i>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-header-dash">
                    <div>
                        <div class="card-label">Ticket Médio</div>
                        <div class="card-value" style="color:var(--blue);">
                            R$ ${(totalValor / totalVendas).toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                    <i class="bi bi-receipt card-icon blue"></i>
                </div>
            </div>
        </div>

        <!-- Gráfico -->
        <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
                <h5>📊 Vendas por Dia</h5>
            </div>
            <div class="card-body">
                <canvas id="graficoRelatorio" style="height:250px;"></canvas>
            </div>
        </div>

        <!-- Produtos mais vendidos -->
        <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
                <h5>📦 Produtos Mais Vendidos</h5>
            </div>
            <div class="card-body" style="padding:0;">
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Total Vendido</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${produtosMaisVendidos.map(p => `
                                <tr>
                                    <td><strong>${p.nome}</strong></td>
                                    <td>${p.quantidade}</td>
                                    <td>R$ ${p.total.toFixed(2).replace('.', ',')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Detalhamento -->
        <div class="card">
            <div class="card-header">
                <h5>📋 Detalhamento das Vendas</h5>
            </div>
            <div class="card-body" style="padding:0;">
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dados.map(v => `
                                <tr>
                                    <td>#${v.id}</td>
                                    <td>${v.clienteNome}</td>
                                    <td>${formatarData(v.dataVenda)}</td>
                                    <td>R$ ${v.total.toFixed(2).replace('.', ',')}</td>
                                    <td>
                                        <span class="badge ${v.status === 'FINALIZADA' ? 'badge-success' : v.status === 'CANCELADA' ? 'badge-danger' : 'badge-warning'}">
                                            ${v.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Gerar gráfico
    gerarGraficoRelatorio(dados);
}

// ============================================================
//  RELATÓRIO POR CLIENTE
// ============================================================

async function gerarRelatorioCliente() {
    const clienteId = document.getElementById('clienteRelatorio')?.value;

    if (!clienteId) {
        mostrarToast('Selecione um cliente', 'warning');
        return;
    }

    try {
        const response = await api.get(ENDPOINTS.relatorios.vendasCliente, {
            params: { clienteId }
        });

        const dados = response.data;
        exibirRelatorioCliente(dados);

    } catch (error) {
        console.error('❌ Erro ao gerar relatório por cliente:', error);
        mostrarToast('Erro ao gerar relatório', 'danger');
    }
}

function exibirRelatorioCliente(dados) {
    const container = document.getElementById('resultadoRelatorio');
    if (!container) return;

    if (!dados || dados.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p>Este cliente não possui compras registradas</p>
            </div>
        `;
        return;
    }

    const totalCompras = dados.length;
    const totalGasto = dados.reduce((sum, v) => sum + v.total, 0);
    const cliente = dados[0]?.clienteNome || 'Cliente';

    container.innerHTML = `
        <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
                <h5>👤 Histórico de Compras - ${cliente}</h5>
            </div>
            <div class="card-body">
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-header-dash">
                            <div>
                                <div class="card-label">Total de Compras</div>
                                <div class="card-value">${totalCompras}</div>
                            </div>
                            <i class="bi bi-cart-check card-icon blue"></i>
                        </div>
                    </div>
                    <div class="dashboard-card">
                        <div class="card-header-dash">
                            <div>
                                <div class="card-label">Total Gasto</div>
                                <div class="card-value" style="color:var(--success);">
                                    R$ ${totalGasto.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <i class="bi bi-currency-dollar card-icon green"></i>
                        </div>
                    </div>
                    <div class="dashboard-card">
                        <div class="card-header-dash">
                            <div>
                                <div class="card-label">Ticket Médio</div>
                                <div class="card-value" style="color:var(--blue);">
                                    R$ ${(totalGasto / totalCompras).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <i class="bi bi-receipt card-icon blue"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h5>📋 Histórico de Compras</h5>
            </div>
            <div class="card-body" style="padding:0;">
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Data</th>
                                <th>Total</th>
                                <th>Itens</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dados.map(v => `
                                <tr>
                                    <td>#${v.id}</td>
                                    <td>${formatarData(v.dataVenda)}</td>
                                    <td>R$ ${v.total.toFixed(2).replace('.', ',')}</td>
                                    <td>${v.itens ? v.itens.length : 0}</td>
                                    <td>
                                        <span class="badge ${v.status === 'FINALIZADA' ? 'badge-success' : v.status === 'CANCELADA' ? 'badge-danger' : 'badge-warning'}">
                                            ${v.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
//  RELATÓRIO DE ESTOQUE BAIXO
// ============================================================

async function gerarRelatorioEstoqueBaixo() {
    try {
        const produtos = await apiProdutos.listar();
        const estoqueBaixo = produtos.filter(p => p.ativo && p.estoque <= p.estoqueMinimo);

        const container = document.getElementById('resultadoRelatorio');
        if (!container) return;

        if (estoqueBaixo.length === 0) {
            container.innerHTML = `
                <div class="empty">
                    <p>✅ Todos os produtos estão com estoque adequado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>⚠️ Produtos com Estoque Baixo</h5>
                    <span class="badge badge-danger">${estoqueBaixo.length} produtos</span>
                </div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Categoria</th>
                                    <th>Estoque Atual</th>
                                    <th>Estoque Mínimo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${estoqueBaixo.map(p => `
                                    <tr class="estoque-baixo">
                                        <td><strong>${p.nome}</strong></td>
                                        <td><span class="badge badge-muted">${CATEGORIAS[p.categoria] || p.categoria}</span></td>
                                        <td style="color:var(--danger); font-weight:700;">${p.estoque}</td>
                                        <td>${p.estoqueMinimo}</td>
                                        <td>
                                            <span class="badge ${p.estoque === 0 ? 'badge-danger' : 'badge-warning'}">
                                                ${p.estoque === 0 ? 'SEM ESTOQUE' : 'ESTOQUE BAIXO'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('❌ Erro ao gerar relatório de estoque baixo:', error);
        mostrarToast('Erro ao gerar relatório', 'danger');
    }
}

// ============================================================
//  RELATÓRIO DE PRODUTOS MAIS VENDIDOS
// ============================================================

async function gerarRelatorioMaisVendidos() {
    try {
        const vendas = await apiVendas.listar();
        const produtosMaisVendidos = calcularProdutosMaisVendidos(vendas);

        const container = document.getElementById('resultadoRelatorio');
        if (!container) return;

        if (produtosMaisVendidos.length === 0) {
            container.innerHTML = `
                <div class="empty">
                    <p>Nenhuma venda registrada ainda</p>
                </div>
            `;
            return;
        }

        const totalGeral = produtosMaisVendidos.reduce((sum, item) => sum + item.total, 0);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>🏆 Produtos Mais Vendidos</h5>
                    <span class="badge badge-primary">${produtosMaisVendidos.length} produtos</span>
                </div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Produto</th>
                                    <th>Quantidade Vendida</th>
                                    <th>Total Arrecadado</th>
                                    <th>Participação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${produtosMaisVendidos.map((p, index) => {
                                    const participacao = (p.total / totalGeral) * 100;
                                    return `
                                        <tr>
                                            <td>${index + 1}º</td>
                                            <td><strong>${p.nome}</strong></td>
                                            <td>${p.quantidade}</td>
                                            <td>R$ ${p.total.toFixed(2).replace('.', ',')}</td>
                                            <td>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width:${participacao}%;"></div>
                                                    <span class="progress-label">${participacao.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('❌ Erro ao gerar relatório de produtos mais vendidos:', error);
        mostrarToast('Erro ao gerar relatório', 'danger');
    }
}

// ============================================================
//  GRÁFICO DO RELATÓRIO
// ============================================================

function gerarGraficoRelatorio(dados) {
    const ctx = document.getElementById('graficoRelatorio');
    if (!ctx) return;

    // Destruir gráfico anterior se existir
    if (graficoRelatorio) {
        graficoRelatorio.destroy();
    }

    // Agrupar por dia
    const vendasPorDia = {};
    dados.forEach(v => {
        const data = new Date(v.dataVenda).toLocaleDateString('pt-BR');
        vendasPorDia[data] = (vendasPorDia[data] || 0) + v.total;
    });

    const labels = Object.keys(vendasPorDia);
    const values = Object.values(vendasPorDia);

    graficoRelatorio = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Vendas por Dia (R$)',
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
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
                        color: '#9CA3AF',
                        maxRotation: 45,
                        font: { size: 10 }
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
//  FUNÇÕES AUXILIARES
// ============================================================

function calcularProdutosMaisVendidos(vendas) {
    const produtosMap = {};

    vendas.forEach(venda => {
        if (venda.itens) {
            venda.itens.forEach(item => {
                const nome = item.produtoNome || `Produto #${item.produtoId}`;
                if (!produtosMap[nome]) {
                    produtosMap[nome] = {
                        nome: nome,
                        quantidade: 0,
                        total: 0
                    };
                }
                produtosMap[nome].quantidade += item.quantidade;
                produtosMap[nome].total += item.subtotal || (item.quantidade * item.precoUnitario);
            });
        }
    });

    return Object.values(produtosMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
}

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

function limparRelatorio() {
    const container = document.getElementById('resultadoRelatorio');
    if (container) {
        container.innerHTML = `
            <div class="empty">
                <p>Selecione um filtro e clique em "Gerar" para visualizar o relatório</p>
            </div>
        `;
    }

    // Limpar gráfico
    if (graficoRelatorio) {
        graficoRelatorio.destroy();
        graficoRelatorio = null;
    }
}

// ============================================================
//  EXPORTAR PARA USO GLOBAL
// ============================================================

window.gerarRelatorioPeriodo = gerarRelatorioPeriodo;
window.gerarRelatorioCliente = gerarRelatorioCliente;
window.gerarRelatorioEstoqueBaixo = gerarRelatorioEstoqueBaixo;
window.gerarRelatorioMaisVendidos = gerarRelatorioMaisVendidos;
window.limparRelatorio = limparRelatorio;