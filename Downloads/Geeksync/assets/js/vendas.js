// js/vendas.js - Adicionar ao final do arquivo

// ============================================================
//  MODAL - NOVO CLIENTE
// ============================================================

let clienteModalCallback = null;

function abrirModalNovoCliente() {
    // Limpar campos
    document.getElementById('novoClienteNome').value = '';
    document.getElementById('novoClienteCpf').value = '';
    document.getElementById('novoClienteEmail').value = '';
    document.getElementById('novoClienteTelefone').value = '';

    // Resetar erros
    ['novoClienteNome', 'novoClienteCpf', 'novoClienteEmail'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });
    ['err-novo-cliente-nome', 'err-novo-cliente-cpf', 'err-novo-cliente-email'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
    });

    // Mostrar modal
    document.getElementById('modalNovoCliente').classList.add('visible');
}

function fecharModalNovoCliente() {
    document.getElementById('modalNovoCliente').classList.remove('visible');
}

async function salvarNovoCliente() {
    const nome = document.getElementById('novoClienteNome').value.trim();
    const cpf = document.getElementById('novoClienteCpf').value.trim();
    const email = document.getElementById('novoClienteEmail').value.trim();
    const telefone = document.getElementById('novoClienteTelefone').value.trim();

    let valido = true;

    // Resetar erros
    ['novoClienteNome', 'novoClienteCpf', 'novoClienteEmail'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });
    ['err-novo-cliente-nome', 'err-novo-cliente-cpf', 'err-novo-cliente-email'].forEach(id => {
        document.getElementById(id).classList.remove('visible');
    });

    if (!nome) {
        document.getElementById('novoClienteNome').classList.add('error');
        document.getElementById('err-novo-cliente-nome').classList.add('visible');
        valido = false;
    }

    const cpfNum = cpf.replace(/\D/g, '');
    if (cpfNum.length !== 11) {
        document.getElementById('novoClienteCpf').classList.add('error');
        document.getElementById('err-novo-cliente-cpf').textContent = 'CPF inválido (11 dígitos)';
        document.getElementById('err-novo-cliente-cpf').classList.add('visible');
        valido = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        document.getElementById('novoClienteEmail').classList.add('error');
        document.getElementById('err-novo-cliente-email').classList.add('visible');
        valido = false;
    }

    if (!valido) return;

    try {
        const cliente = {
            nome,
            cpf: cpfNum,
            email,
            telefone,
            endereco: ''
        };

        const response = await apiClientes.criar(cliente);
        
        // Fechar modal
        fecharModalNovoCliente();
        
        // Recarregar lista de clientes
        await carregarDadosVenda();
        
        // Selecionar o cliente criado automaticamente
        const selectCliente = document.getElementById('clienteVenda');
        if (selectCliente) {
            selectCliente.value = response.id;
        }
        
        mostrarToast('✅ Cliente cadastrado com sucesso!', 'success');

    } catch (error) {
        console.error('❌ Erro ao criar cliente:', error);
        const msg = error.response?.data?.message || 'Erro ao cadastrar cliente';
        mostrarToast(msg, 'danger');
        
        // Se CPF duplicado
        if (error.response?.status === 409) {
            document.getElementById('novoClienteCpf').classList.add('error');
            document.getElementById('err-novo-cliente-cpf').textContent = 'CPF já cadastrado';
            document.getElementById('err-novo-cliente-cpf').classList.add('visible');
        }
    }
}

// Fechar modal clicando fora
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalNovoCliente');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalNovoCliente();
            }
        });
    }
});

// ============================================================
//  EXPORTAR FUNÇÕES DO MODAL
// ============================================================

window.abrirModalNovoCliente = abrirModalNovoCliente;
window.fecharModalNovoCliente = fecharModalNovoCliente;
window.salvarNovoCliente = salvarNovoCliente;