// js/clientes.js
// CRUD de Clientes - Integração com Backend Spring Boot

// ============================================================
//  ESTADO
// ============================================================

let clientes = [];
let clienteEmEdicao = null;
let clienteParaDesativar = null;

// ============================================================
//  INICIALIZAÇÃO (chamado pelo main.js)
// ============================================================

async function carregarClientes() {
    try {
        console.log('📋 Carregando clientes...');
        clientes = await apiClientes.listar();
        renderizarTabelaClientes();
        console.log(`✅ ${clientes.length} clientes carregados`);
    } catch (error) {
        console.error('❌ Erro ao carregar clientes:', error);
        mostrarToast('Erro ao carregar lista de clientes', 'danger');
    }
}

// ============================================================
//  RENDERIZAR TABELA
// ============================================================

function renderizarTabelaClientes(lista = null) {
    const dados = lista || clientes;
    const tbody = document.getElementById('tabelaClientes');
    
    if (!tbody) return;

    if (!dados || dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    <p>Nenhum cliente encontrado.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = dados.map(cliente => `
        <tr>
            <td style="color:var(--muted)">#${cliente.id}</td>
            <td>
                <strong>${cliente.nome}</strong>
                ${!cliente.ativo ? `
                    <br>
                    <span class="badge badge-muted" style="font-size:0.7rem;">Inativo</span>
                ` : ''}
            </td>
            <td style="font-family:monospace;font-size:.85rem">${cliente.cpf}</td>
            <td>${cliente.telefone || '—'}</td>
            <td style="color:var(--muted)">${cliente.email}</td>
            <td>
                <span class="badge ${cliente.ativo ? 'badge-success' : 'badge-muted'}">
                    ${cliente.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td style="white-space:nowrap">
                <!-- Botão Editar -->
                <button class="btn-icon" onclick="editarCliente(${cliente.id})" title="Editar">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"/>
                    </svg>
                </button>

                ${cliente.ativo 
                    ? `
                        <button class="btn-icon del" onclick="abrirModalDesativarCliente(${cliente.id})" title="Desativar">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/>
                            </svg>
                        </button>
                    `
                    : `
                        <button class="btn-icon" onclick="reativarCliente(${cliente.id})" title="Reativar" style="color:var(--success);border-color:var(--success)">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </button>
                    `
                }

                <!-- Botão Excluir (apenas se não tiver vendas) -->
                ${cliente.temVendas === false ? `
                    <button class="btn-icon del" onclick="excluirCliente(${cliente.id})" title="Excluir permanentemente">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22"/>
                        </svg>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// ============================================================
//  PESQUISAR
// ============================================================

async function pesquisarCliente() {
    const texto = document.getElementById('pesquisaCliente')?.value?.trim() || '';

    if (texto.length === 0) {
        await carregarClientes();
        return;
    }

    try {
        const resultado = await apiClientes.pesquisar(texto);
        renderizarTabelaClientes(resultado);
    } catch (error) {
        console.error('❌ Erro ao pesquisar clientes:', error);
        mostrarToast('Erro ao pesquisar clientes', 'danger');
    }
}

// ============================================================
//  MODAL - ABRIR/FECHAR
// ============================================================

function abrirModalCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('modalClienteTitle').textContent = '👤 Novo Cliente';
    limparFormularioCliente();
    document.getElementById('modalCliente').classList.add('visible');
}

function fecharModalCliente() {
    document.getElementById('modalCliente').classList.remove('visible');
    limparFormularioCliente();
}

// ============================================================
//  SALVAR CLIENTE (CREATE/UPDATE)
// ============================================================

async function salvarCliente() {
    const id = document.getElementById('clienteId').value;
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();

    let valido = true;

    // Resetar erros
    ['nome', 'cpf', 'email'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });
    ['err-nome', 'err-cpf', 'err-email'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
    });

    if (!nome) {
        document.getElementById('nome').classList.add('error');
        document.getElementById('err-nome').classList.add('visible');
        valido = false;
    }

    const cpfNum = cpf.replace(/\D/g, '');
    if (cpfNum.length !== 11) {
        document.getElementById('cpf').classList.add('error');
        document.getElementById('err-cpf').textContent = 'CPF inválido (11 dígitos)';
        document.getElementById('err-cpf').classList.add('visible');
        valido = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        document.getElementById('email').classList.add('error');
        document.getElementById('err-email').classList.add('visible');
        valido = false;
    }

    if (!valido) return;

    const cliente = { nome, cpf: cpfNum, email, telefone, endereco };

    try {
        if (id) {
            // Editar
            await apiClientes.atualizar(Number(id), cliente);
            mostrarToast('✅ Cliente atualizado com sucesso!', 'success');
        } else {
            // Novo
            await apiClientes.criar(cliente);
            mostrarToast('✅ Cliente cadastrado com sucesso!', 'success');
        }

        fecharModalCliente();
        await carregarClientes();

    } catch (error) {
        console.error('❌ Erro ao salvar cliente:', error);
        if (error.response?.status === 409) {
            document.getElementById('cpf').classList.add('error');
            document.getElementById('err-cpf').textContent = 'CPF já cadastrado';
            document.getElementById('err-cpf').classList.add('visible');
        } else {
            mostrarToast('Erro ao salvar cliente', 'danger');
        }
    }
}

// ============================================================
//  EDITAR CLIENTE
// ============================================================

async function editarCliente(id) {
    try {
        const cliente = await apiClientes.buscar(id);

        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('modalClienteTitle').textContent = '✏️ Editar Cliente';
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('cpf').value = cliente.cpf;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefone').value = cliente.telefone || '';
        document.getElementById('endereco').value = cliente.endereco || '';

        document.getElementById('modalCliente').classList.add('visible');

    } catch (error) {
        console.error(`❌ Erro ao buscar cliente ${id}:`, error);
        mostrarToast('Erro ao carregar dados do cliente', 'danger');
    }
}

// ============================================================
//  DESATIVAR / REATIVAR CLIENTE
// ============================================================

function abrirModalDesativarCliente(id) {
    clienteParaDesativar = id;
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        document.getElementById('modal-cli-name').textContent = cliente.nome;
        document.getElementById('modal-desat-cli').classList.add('visible');
    }
}

async function confirmDesatCliente() {
    if (!clienteParaDesativar) return;

    try {
        await apiClientes.desativar(clienteParaDesativar);
        closeModal('modal-desat-cli');
        mostrarToast('Cliente desativado com sucesso', 'warning');
        await carregarClientes();
    } catch (error) {
        console.error('❌ Erro ao desativar cliente:', error);
        mostrarToast('Erro ao desativar cliente', 'danger');
    }
    clienteParaDesativar = null;
}

async function reativarCliente(id) {
    try {
        await apiClientes.ativar(id);
        mostrarToast('Cliente reativado com sucesso!', 'success');
        await carregarClientes();
    } catch (error) {
        console.error('❌ Erro ao reativar cliente:', error);
        mostrarToast('Erro ao reativar cliente', 'danger');
    }
}

// ============================================================
//  EXCLUIR CLIENTE (apenas se não tiver vendas)
// ============================================================

async function excluirCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    if (!confirm(`Tem certeza que deseja excluir permanentemente o cliente "${cliente.nome}"?`)) {
        return;
    }

    try {
        await apiClientes.deletar(id);
        mostrarToast('Cliente excluído com sucesso', 'success');
        await carregarClientes();
    } catch (error) {
        console.error('❌ Erro ao excluir cliente:', error);
        const msg = error.response?.data?.message || 'Erro ao excluir cliente';
        mostrarToast(msg, 'danger');
    }
}

// ============================================================
//  LIMPAR FORMULÁRIO
// ============================================================

function limparFormularioCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';

    ['nome', 'cpf', 'email'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });
    ['err-nome', 'err-cpf', 'err-email'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
    });
}

// ============================================================
//  EXPORTAÇÕES GLOBAIS
// ============================================================

window.carregarClientes = carregarClientes;
window.renderizarTabelaClientes = renderizarTabelaClientes;
window.pesquisarCliente = pesquisarCliente;
window.abrirModalCliente = abrirModalCliente;
window.fecharModalCliente = fecharModalCliente;
window.salvarCliente = salvarCliente;
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;
window.abrirModalDesativarCliente = abrirModalDesativarCliente;
window.confirmDesatCliente = confirmDesatCliente;
window.reativarCliente = reativarCliente;

console.log('✅ clientes.js carregado com sucesso!');