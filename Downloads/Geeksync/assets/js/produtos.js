// js/produtos.js
// CRUD de Produtos - Integração com Backend Spring Boot

// ============================================================
//  ESTADO
// ============================================================

let produtos = [];
let editando = false;
let produtoEmEdicao = null;
let produtoAlvo = null;

const CATEGORIAS = {
    MANGA: 'Mangá',
    LIVRO_FICCAO: 'Ficção Científica',
    ACTION_FIGURE: 'Action Figure',
    JOGO_TABULEIRO: 'Jogo de Tabuleiro'
};

// ============================================================
//  INICIALIZAÇÃO (chamado automaticamente)
// ============================================================

// 🔥 O DOMContentLoaded já está AQUI dentro do arquivo!
document.addEventListener("DOMContentLoaded", async function() {
    console.log('📦 Inicializando módulo de produtos...');
    
    // Verificar autenticação
    if (typeof isAutenticado === 'function' && isAutenticado()) {
        await carregarProdutos();
        console.log('✅ Produtos carregados');
    } else {
        console.warn('⚠️ Usuário não autenticado');
        // Se estiver em uma página separada, redirecionar
        if (window.location.pathname.includes('pages/')) {
            window.location.href = '../index.html';
        }
    }
});

// ============================================================
//  CARREGAR PRODUTOS
// ============================================================

async function carregarProdutos() {
    try {
        produtos = await apiProdutos.listar();
        renderizarTabela();
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        mostrarToast('Erro ao carregar lista de produtos', 'danger');
    }
}

// ============================================================
//  RENDERIZAR TABELA
// ============================================================

function renderizarTabela(lista = null) {
    const dados = lista || produtos;
    const tbody = document.getElementById("tabelaProdutos");
    
    if (!tbody) return;

    if (!dados || dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    <p>Nenhum produto encontrado.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = dados.map(produto => {
        const estoqueBaixo = produto.estoque <= produto.estoqueMinimo;
        const corEstoque = produto.estoque === 0 ? 'var(--danger)' 
                         : estoqueBaixo ? 'var(--warning)' 
                         : 'var(--text)';

        let status = "Em estoque";
        let badge = "badge-success";
        
        if (produto.estoque <= 0) {
            status = "Sem estoque";
            badge = "badge-danger";
        } else if (produto.estoque <= produto.estoqueMinimo) {
            status = "Estoque baixo";
            badge = "badge-warning";
        }
        
        if (!produto.ativo) {
            status = "Inativo";
            badge = "badge-muted";
        }

        return `
            <tr class="${estoqueBaixo && produto.ativo ? 'estoque-baixo' : ''}">
                <td style="color:var(--muted)">#${produto.id}</td>
                <td>
                    <strong>${produto.nome}</strong>
                    ${estoqueBaixo && produto.estoque > 0 && produto.ativo ? `
                        <br>
                        <span class="estoque-warn">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                            </svg>
                            Estoque baixo
                        </span>
                    ` : ''}
                </td>
                <td>
                    <span class="badge badge-muted">${CATEGORIAS[produto.categoria] || produto.categoria}</span>
                </td>
                <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
                <td>
                    <span style="color:${corEstoque}; font-weight:${estoqueBaixo ? '700' : '400'}">
                        ${produto.estoque}
                    </span>
                </td>
                <td>${produto.estoqueMinimo}</td>
                <td>
                    <span class="badge ${badge}">
                        ${status}
                    </span>
                </td>
                <td style="white-space:nowrap">
                    <button class="btn-icon" onclick="editarProduto(${produto.id})" title="Editar">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"/>
                        </svg>
                    </button>

                    ${produto.ativo 
                        ? `
                            <button class="btn-icon del" onclick="abrirModalDesativarProduto(${produto.id})" title="Desativar">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/>
                                </svg>
                            </button>
                        `
                        : `
                            <button class="btn-icon" onclick="reativarProduto(${produto.id})" title="Reativar" style="color:var(--success);border-color:var(--success)">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </button>
                        `
                    }

                    ${produto.temVendas === false ? `
                        <button class="btn-icon del" onclick="excluirProduto(${produto.id})" title="Excluir permanentemente">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22"/>
                            </svg>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================================
//  PESQUISAR
// ============================================================

function pesquisarProduto() {
    const texto = document.getElementById('pesquisaProduto')?.value?.toLowerCase() || '';
    const categoria = document.getElementById('categoriaFiltro')?.value || '';

    const filtrados = produtos.filter(p => {
        const nomeMatch = p.nome.toLowerCase().includes(texto);
        const catMatch = !categoria || p.categoria === categoria;
        return nomeMatch && catMatch;
    });

    renderizarTabela(filtrados);
}

// ============================================================
//  NOVO PRODUTO
// ============================================================

function novoProduto() {
    editando = false;
    produtoEmEdicao = null;
    
    document.getElementById('produtoId').value = '';
    document.getElementById('form-prod-title').textContent = '📦 Novo Produto';
    document.getElementById('produtos-list-view').style.display = 'none';
    document.getElementById('produtos-form-view').style.display = 'block';
    
    limparFormularioProduto();
}

// ============================================================
//  CANCELAR
// ============================================================

function cancelarProduto() {
    document.getElementById('produtos-form-view').style.display = 'none';
    document.getElementById('produtos-list-view').style.display = 'block';
    limparFormularioProduto();
}

// ============================================================
//  SALVAR PRODUTO
// ============================================================

async function salvarProduto() {
    const id = document.getElementById('produtoId').value;
    const nome = document.getElementById('prod-nome').value.trim();
    const categoria = document.getElementById('prod-cat').value;
    const descricao = document.getElementById('prod-desc').value.trim();
    const preco = parseFloat(document.getElementById('prod-preco').value);
    const estoque = parseInt(document.getElementById('prod-estoque').value);
    const estoqueMinimo = parseInt(document.getElementById('prod-minimo').value);

    let valido = true;

    // Resetar erros
    ['prod-nome', 'prod-cat', 'prod-preco', 'prod-estoque', 'prod-minimo'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });
    ['err-prod-nome', 'err-prod-cat', 'err-prod-preco', 'err-prod-estoque', 'err-prod-minimo'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
    });

    if (!nome) {
        document.getElementById('prod-nome').classList.add('error');
        document.getElementById('err-prod-nome').classList.add('visible');
        valido = false;
    }

    if (!categoria) {
        document.getElementById('err-prod-cat').classList.add('visible');
        valido = false;
    }

    if (isNaN(preco) || preco <= 0) {
        document.getElementById('prod-preco').classList.add('error');
        document.getElementById('err-prod-preco').classList.add('visible');
        valido = false;
    }

    if (isNaN(estoque) || estoque < 0) {
        document.getElementById('prod-estoque').classList.add('error');
        document.getElementById('err-prod-estoque').classList.add('visible');
        valido = false;
    }

    if (isNaN(estoqueMinimo) || estoqueMinimo < 0) {
        document.getElementById('prod-minimo').classList.add('error');
        document.getElementById('err-prod-minimo').classList.add('visible');
        valido = false;
    }

    if (!valido) return;

    const produto = { nome, categoria, descricao, preco, estoque, estoqueMinimo };

    try {
        if (id) {
            await apiProdutos.atualizar(Number(id), produto);
            mostrarToast('✅ Produto atualizado com sucesso!', 'success');
        } else {
            await apiProdutos.criar(produto);
            mostrarToast('✅ Produto cadastrado com sucesso!', 'success');
        }

        cancelarProduto();
        await carregarProdutos();

    } catch (error) {
        console.error('❌ Erro ao salvar produto:', error);
        mostrarToast('Erro ao salvar produto', 'danger');
    }
}

// ============================================================
//  EDITAR PRODUTO
// ============================================================

async function editarProduto(id) {
    try {
        const produto = await apiProdutos.buscar(id);

        document.getElementById('produtoId').value = produto.id;
        document.getElementById('form-prod-title').textContent = '✏️ Editar Produto';
        document.getElementById('prod-nome').value = produto.nome;
        document.getElementById('prod-cat').value = produto.categoria;
        document.getElementById('prod-desc').value = produto.descricao || '';
        document.getElementById('prod-preco').value = produto.preco;
        document.getElementById('prod-estoque').value = produto.estoque;
        document.getElementById('prod-minimo').value = produto.estoqueMinimo;

        document.getElementById('produtos-list-view').style.display = 'none';
        document.getElementById('produtos-form-view').style.display = 'block';

    } catch (error) {
        console.error(`❌ Erro ao buscar produto ${id}:`, error);
        mostrarToast('Erro ao carregar dados do produto', 'danger');
    }
}

// ============================================================
//  DESATIVAR / REATIVAR
// ============================================================

function abrirModalDesativarProduto(id) {
    produtoAlvo = id;
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        document.getElementById('modal-prod-name').textContent = produto.nome;
        document.getElementById('modal-desat-prod').classList.add('visible');
    }
}

async function confirmDesatProduto() {
    if (!produtoAlvo) return;

    try {
        await apiProdutos.desativar(produtoAlvo);
        closeModal('modal-desat-prod');
        mostrarToast('Produto desativado com sucesso', 'warning');
        await carregarProdutos();
    } catch (error) {
        console.error('❌ Erro ao desativar produto:', error);
        mostrarToast('Erro ao desativar produto', 'danger');
    }
    produtoAlvo = null;
}

async function reativarProduto(id) {
    try {
        await apiProdutos.ativar(id);
        mostrarToast('Produto reativado com sucesso!', 'success');
        await carregarProdutos();
    } catch (error) {
        console.error('❌ Erro ao reativar produto:', error);
        mostrarToast('Erro ao reativar produto', 'danger');
    }
}

// ============================================================
//  EXCLUIR PRODUTO
// ============================================================

async function excluirProduto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    if (!confirm(`Tem certeza que deseja excluir permanentemente o produto "${produto.nome}"?`)) {
        return;
    }

    try {
        await apiProdutos.deletar(id);
        mostrarToast('Produto excluído com sucesso', 'success');
        await carregarProdutos();
    } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
        const msg = error.response?.data?.message || 'Erro ao excluir produto';
        mostrarToast(msg, 'danger');
    }
}

// ============================================================
//  LIMPAR FORMULÁRIO
// ============================================================

function limparFormularioProduto() {
    document.getElementById('produtoId').value = '';
    document.getElementById('prod-nome').value = '';
    document.getElementById('prod-cat').value = '';
    document.getElementById('prod-desc').value = '';
    document.getElementById('prod-preco').value = '';
    document.getElementById('prod-estoque').value = '';
    document.getElementById('prod-minimo').value = '5';

    ['prod-nome', 'prod-cat', 'prod-preco', 'prod-estoque', 'prod-minimo'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });
    ['err-prod-nome', 'err-prod-cat', 'err-prod-preco', 'err-prod-estoque', 'err-prod-minimo'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
    });
}

// ============================================================
//  EXPORTAÇÕES GLOBAIS
// ============================================================

window.carregarProdutos = carregarProdutos;
window.renderizarTabela = renderizarTabela;
window.pesquisarProduto = pesquisarProduto;
window.novoProduto = novoProduto;
window.cancelarProduto = cancelarProduto;
window.salvarProduto = salvarProduto;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.abrirModalDesativarProduto = abrirModalDesativarProduto;
window.confirmDesatProduto = confirmDesatProduto;
window.reativarProduto = reativarProduto;

console.log('✅ produtos.js carregado com sucesso!');