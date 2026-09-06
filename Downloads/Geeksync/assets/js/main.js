// js/main.js
// Inicialização Principal do Sistema

// ============================================================
//  INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 GeekSync ERP Inicializando...');

    // Verificar autenticação
    const token = localStorage.getItem('jwt_token');
    const usuario = getUsuarioLogado();

    if (token && usuario) {
        // Usuário já autenticado
        console.log('✅ Usuário autenticado:', usuario.nome);
        
        document.getElementById('page-login').classList.remove('active');
        document.getElementById('page-app').classList.add('active');
        
        document.getElementById('user-display-name').textContent = usuario.nome;
        document.getElementById('user-display-role').textContent = usuario.perfil;
        document.getElementById('user-avatar').textContent = usuario.nome[0];

        // Carregar páginas e dados
        await carregarTodasPaginas();
        await carregarDadosIniciais();
    } else {
        // Usuário não autenticado - mostrar login
        console.log('🔐 Usuário não autenticado');
        document.getElementById('page-login').classList.add('active');
        document.getElementById('page-app').classList.remove('active');
    }

    // Configurar evento de Enter no login
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.getElementById('page-login').classList.contains('active')) {
            doLogin();
        }
    });
});

// ============================================================
//  CARREGAR PÁGINAS
// ============================================================

async function carregarTodasPaginas() {
    const paginas = ['clientes', 'produtos', 'vendas', 'relatorios'];
    
    for (const pagina of paginas) {
        await carregarPagina(pagina);
    }
}

async function carregarPagina(section) {
    try {
        console.log(`📄 Carregando página: ${section}`);
        
        const response = await fetch(`pages/${section}.html`);
        
        if (!response.ok) {
            console.warn(`⚠️ Página ${section}.html não encontrada (status: ${response.status})`);
            const container = document.getElementById(`${section}-content`);
            if (container) {
                container.innerHTML = `
                    <div class="empty">
                        <p>⚠️ Página ${section} não encontrada.</p>
                        <p style="font-size:.8rem; color:var(--muted);">
                            Verifique se o arquivo <strong>pages/${section}.html</strong> existe.
                        </p>
                    </div>
                `;
            }
            return;
        }
        
        const html = await response.text();
        const container = document.getElementById(`${section}-content`);
        if (container) {
            container.innerHTML = html;
            console.log(`✅ Página ${section} carregada`);
        }

        // 🔥 IMPORTANTE: Inicializar módulo específico APÓS carregar o HTML
        await inicializarModulo(section);

    } catch (error) {
        console.error(`❌ Erro ao carregar página ${section}:`, error);
        const container = document.getElementById(`${section}-content`);
        if (container) {
            container.innerHTML = `
                <div class="empty">
                    <p>❌ Erro ao carregar página ${section}.</p>
                    <p style="font-size:.8rem; color:var(--danger);">
                        ${error.message}
                    </p>
                </div>
            `;
        }
    }
}

// ============================================================
//  INICIALIZAR MÓDULOS (APÓS CARREGAR O HTML)
// ============================================================

async function inicializarModulo(section) {
    console.log(`🔧 Inicializando módulo: ${section}`);
    
    switch(section) {
        case 'clientes':
            if (typeof carregarClientes === 'function') {
                await carregarClientes();
                console.log('✅ Clientes inicializado');
            } else {
                console.warn('⚠️ carregarClientes não está definido');
            }
            break;
            
        case 'produtos':
            if (typeof carregarProdutos === 'function') {
                await carregarProdutos();
                console.log('✅ Produtos inicializado');
            } else {
                console.warn('⚠️ carregarProdutos não está definido');
            }
            break;
            
        case 'vendas':
            // 🔥 CHAMAR AS FUNÇÕES DE INICIALIZAÇÃO DO VENDAS.JS
            if (typeof carregarDadosVenda === 'function') {
                await carregarDadosVenda();
                console.log('✅ Dados de venda carregados');
            } else {
                console.warn('⚠️ carregarDadosVenda não está definido');
            }
            
            if (typeof carregarVendasAbertas === 'function') {
                await carregarVendasAbertas();
                console.log('✅ Vendas abertas carregadas');
            }
            
            if (typeof listarVendas === 'function') {
                await listarVendas();
                console.log('✅ Histórico de vendas carregado');
            }
            
            // Configurar eventos do vendas.js
            if (typeof configurarEventosVendas === 'function') {
                configurarEventosVendas();
                console.log('✅ Eventos de vendas configurados');
            }
            
            console.log('✅ Vendas inicializado');
            break;
            
        case 'relatorios':
            if (typeof carregarResumoRapido === 'function') {
                await carregarResumoRapido();
                console.log('✅ Resumo rápido carregado');
            } else {
                console.warn('⚠️ carregarResumoRapido não está definido');
            }
            
            if (typeof carregarSelectClientes === 'function') {
                await carregarSelectClientes();
                console.log('✅ Select de clientes carregado');
            }
            
            // Configurar datas
            configurarDatasRelatorio();
            
            console.log('✅ Relatórios inicializado');
            break;
    }
}

// ============================================================
//  CONFIGURAR DATAS DO RELATÓRIO
// ============================================================

function configurarDatasRelatorio() {
    const dataInicio = document.getElementById('dataInicio');
    if (dataInicio) {
        const hoje = new Date();
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicio.value = primeiroDia.toISOString().split('T')[0];
    }
    
    const dataFim = document.getElementById('dataFim');
    if (dataFim) {
        const hoje = new Date();
        dataFim.value = hoje.toISOString().split('T')[0];
    }
}

// ============================================================
//  CARREGAR DADOS INICIAIS
// ============================================================

async function carregarDadosIniciais() {
    try {
        console.log('📊 Carregando dados iniciais...');
        
        // Carregar dados em paralelo
        const promises = [];
        
        if (typeof carregarClientes === 'function') {
            promises.push(carregarClientes());
        }
        
        if (typeof carregarProdutos === 'function') {
            promises.push(carregarProdutos());
        }
        
        if (promises.length > 0) {
            await Promise.all(promises);
            console.log('✅ Dados iniciais carregados');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
    }
}

// ============================================================
//  EXPORTAÇÕES GLOBAIS
// ============================================================

window.carregarPagina = carregarPagina;
window.carregarTodasPaginas = carregarTodasPaginas;
window.carregarDadosIniciais = carregarDadosIniciais;
window.inicializarModulo = inicializarModulo;
window.configurarDatasRelatorio = configurarDatasRelatorio;

console.log('✅ main.js carregado com sucesso!');