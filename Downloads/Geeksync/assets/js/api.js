// js/api.js
// Configuração da API para comunicação com o backend Spring Boot

// ============================================================
//  CONFIGURAÇÃO BASE
// ============================================================

const API_BASE_URL = 'http://localhost:8080/api';

// Criar instância do Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================================
//  INTERCEPTADOR DE REQUISIÇÃO (Adiciona token JWT)
// ============================================================

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// ============================================================
//  INTERCEPTADOR DE RESPOSTA (Trata 401 - Token expirado)
// ============================================================

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('usuario');
            window.location.href = '/index.html';
            mostrarToast('Sessão expirada. Faça login novamente.', 'warning');
        }
        return Promise.reject(error);
    }
);

// ============================================================
//  TOAST / NOTIFICAÇÕES
// ============================================================

function mostrarToast(mensagem, tipo = 'success') {
    // Cria um toast simples
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;

    const cores = {
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };

    toast.style.background = cores[tipo] || cores.info;
    toast.textContent = mensagem;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Adicionar keyframe de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// ============================================================
//  ENDPOINTS
// ============================================================

const ENDPOINTS = {
    // Autenticação
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        me: '/auth/me'
    },

    // Produtos
    produtos: {
        listar: '/produtos',
        buscar: (id) => `/produtos/${id}`,
        criar: '/produtos',
        atualizar: (id) => `/produtos/${id}`,
        deletar: (id) => `/produtos/${id}`,
        desativar: (id) => `/produtos/${id}/desativar`,
        ativar: (id) => `/produtos/${id}/ativar`,
        pesquisar: '/produtos/search',
        categorias: '/produtos/categorias'
    },

    // Clientes
    clientes: {
        listar: '/clientes',
        buscar: (id) => `/clientes/${id}`,
        criar: '/clientes',
        atualizar: (id) => `/clientes/${id}`,
        deletar: (id) => `/clientes/${id}`,
        desativar: (id) => `/clientes/${id}/desativar`,
        ativar: (id) => `/clientes/${id}/ativar`
    },

    // Vendas
    vendas: {
        listar: '/vendas',
        buscar: (id) => `/vendas/${id}`,
        criar: '/vendas',
        cancelar: (id) => `/vendas/${id}/cancelar`,
        finalizar: (id) => `/vendas/${id}/finalizar`
    },

    // Relatórios
    relatorios: {
        vendasPeriodo: '/relatorios/vendas/periodo',
        vendasCliente: '/relatorios/vendas/cliente',
        vendasAnuais: '/relatorios/vendas/anual',
        produtosMaisVendidos: '/relatorios/produtos/mais-vendidos',
        estoqueBaixo: '/relatorios/produtos/estoque-baixo'
    }
};

// ============================================================
//  API - PRODUTOS
// ============================================================

const apiProdutos = {
    // Listar todos os produtos
    listar: async () => {
        try {
            const response = await api.get(ENDPOINTS.produtos.listar);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            throw error;
        }
    },

    // Buscar produto por ID
    buscar: async (id) => {
        try {
            const response = await api.get(ENDPOINTS.produtos.buscar(id));
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar produto ${id}:`, error);
            throw error;
        }
    },

    // Criar novo produto
    criar: async (produto) => {
        try {
            const response = await api.post(ENDPOINTS.produtos.criar, produto);
            mostrarToast('Produto cadastrado com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            const msg = error.response?.data?.message || 'Erro ao cadastrar produto';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Atualizar produto
    atualizar: async (id, produto) => {
        try {
            const response = await api.put(ENDPOINTS.produtos.atualizar(id), produto);
            mostrarToast('Produto atualizado com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar produto ${id}:`, error);
            const msg = error.response?.data?.message || 'Erro ao atualizar produto';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Desativar produto
    desativar: async (id) => {
        try {
            const response = await api.put(ENDPOINTS.produtos.desativar(id));
            mostrarToast('Produto desativado com sucesso', 'warning');
            return response.data;
        } catch (error) {
            console.error(`Erro ao desativar produto ${id}:`, error);
            mostrarToast('Erro ao desativar produto', 'danger');
            throw error;
        }
    },

    // Reativar produto
    ativar: async (id) => {
        try {
            const response = await api.put(ENDPOINTS.produtos.ativar(id));
            mostrarToast('Produto reativado com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error(`Erro ao reativar produto ${id}:`, error);
            mostrarToast('Erro ao reativar produto', 'danger');
            throw error;
        }
    },

    // Deletar produto (apenas se não tiver vendas)
    deletar: async (id) => {
        try {
            const response = await api.delete(ENDPOINTS.produtos.deletar(id));
            mostrarToast('Produto excluído com sucesso', 'success');
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar produto ${id}:`, error);
            const msg = error.response?.data?.message || 'Erro ao excluir produto';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Pesquisar produtos
    pesquisar: async (termo, categoria) => {
        try {
            const params = new URLSearchParams();
            if (termo) params.append('termo', termo);
            if (categoria) params.append('categoria', categoria);
            
            const response = await api.get(`${ENDPOINTS.produtos.pesquisar}?${params}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
            throw error;
        }
    },

    // Listar categorias
    listarCategorias: async () => {
        try {
            const response = await api.get(ENDPOINTS.produtos.categorias);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            throw error;
        }
    }
};

// ============================================================
//  EXPORTAR PARA USO GLOBAL
// ============================================================

// Tornar disponível globalmente
window.api = api;
window.apiProdutos = apiProdutos;
window.mostrarToast = mostrarToast;
window.ENDPOINTS = ENDPOINTS;

console.log('✅ API configurada com sucesso!');
// js/api.js - Adicionar no final do arquivo

// ============================================================
//  API - CLIENTES
// ============================================================

const apiClientes = {
    // Listar todos os clientes
    listar: async () => {
        try {
            const response = await api.get(ENDPOINTS.clientes.listar);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            throw error;
        }
    },

    // Buscar cliente por ID
    buscar: async (id) => {
        try {
            const response = await api.get(ENDPOINTS.clientes.buscar(id));
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cliente ${id}:`, error);
            throw error;
        }
    },

    // Criar novo cliente
    criar: async (cliente) => {
        try {
            const response = await api.post(ENDPOINTS.clientes.criar, cliente);
            mostrarToast('Cliente cadastrado com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            const msg = error.response?.data?.message || 'Erro ao cadastrar cliente';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Atualizar cliente
    atualizar: async (id, cliente) => {
        try {
            const response = await api.put(ENDPOINTS.clientes.atualizar(id), cliente);
            mostrarToast('Cliente atualizado com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar cliente ${id}:`, error);
            const msg = error.response?.data?.message || 'Erro ao atualizar cliente';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Desativar cliente
    desativar: async (id) => {
        try {
            const response = await api.put(ENDPOINTS.clientes.desativar(id));
            return response.data;
        } catch (error) {
            console.error(`Erro ao desativar cliente ${id}:`, error);
            throw error;
        }
    },

    // Reativar cliente
    ativar: async (id) => {
        try {
            const response = await api.put(ENDPOINTS.clientes.ativar(id));
            return response.data;
        } catch (error) {
            console.error(`Erro ao reativar cliente ${id}:`, error);
            throw error;
        }
    },

    // Deletar cliente (apenas se não tiver vendas)
    deletar: async (id) => {
        try {
            const response = await api.delete(ENDPOINTS.clientes.deletar(id));
            mostrarToast('Cliente excluído com sucesso', 'success');
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar cliente ${id}:`, error);
            const msg = error.response?.data?.message || 'Erro ao excluir cliente';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Pesquisar clientes
    pesquisar: async (termo) => {
        try {
            const response = await api.get(`${ENDPOINTS.clientes.pesquisar}?termo=${encodeURIComponent(termo)}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao pesquisar clientes:', error);
            throw error;
        }
    }
};

// Tornar disponível globalmente
window.apiClientes = apiClientes;

// js/api.js - Adicionar no final do arquivo

// ============================================================
//  ENDPOINTS - VENDAS
// ============================================================

ENDPOINTS.vendas = {
    listar: '/vendas',
    buscar: (id) => `/vendas/${id}`,
    criar: '/vendas',
    cancelar: (id) => `/vendas/${id}/cancelar`,
    finalizar: (id) => `/vendas/${id}/finalizar`,
    totalFaturamento: '/vendas/total-faturamento',
    vendasPorMes: '/vendas/vendas-por-mes',
    ultimasAtividades: '/vendas/ultimas-atividades'
};

// ============================================================
//  API - VENDAS
// ============================================================

const apiVendas = {
    // Listar todas as vendas
    listar: async () => {
        try {
            const response = await api.get(ENDPOINTS.vendas.listar);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar vendas:', error);
            throw error;
        }
    },

    // Buscar venda por ID
    buscar: async (id) => {
        try {
            const response = await api.get(ENDPOINTS.vendas.buscar(id));
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar venda ${id}:`, error);
            throw error;
        }
    },

    // Criar nova venda
    criar: async (venda) => {
        try {
            const response = await api.post(ENDPOINTS.vendas.criar, venda);
            mostrarToast('Venda registrada com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error('Erro ao criar venda:', error);
            const msg = error.response?.data?.message || 'Erro ao registrar venda';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Finalizar venda
    finalizar: async (id) => {
        try {
            const response = await api.put(ENDPOINTS.vendas.finalizar(id));
            mostrarToast('Venda finalizada com sucesso!', 'success');
            return response.data;
        } catch (error) {
            console.error(`Erro ao finalizar venda ${id}:`, error);
            const msg = error.response?.data?.message || 'Erro ao finalizar venda';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Cancelar venda
    cancelar: async (id) => {
        try {
            const response = await api.put(ENDPOINTS.vendas.cancelar(id));
            mostrarToast('Venda cancelada com sucesso', 'warning');
            return response.data;
        } catch (error) {
            console.error(`Erro ao cancelar venda ${id}:`, error);
            const msg = error.response?.data?.message || 'Erro ao cancelar venda';
            mostrarToast(msg, 'danger');
            throw error;
        }
    },

    // Total de faturamento
    totalFaturamento: async () => {
        try {
            const response = await api.get(ENDPOINTS.vendas.totalFaturamento);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar faturamento:', error);
            return 0;
        }
    },

    // Vendas por mês (para gráfico)
    vendasPorMes: async () => {
        try {
            const response = await api.get(ENDPOINTS.vendas.vendasPorMes);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar vendas por mês:', error);
            return [];
        }
    },

    // Últimas atividades
    ultimasAtividades: async (limite = 5) => {
        try {
            const response = await api.get(`${ENDPOINTS.vendas.ultimasAtividades}?limite=${limite}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar últimas atividades:', error);
            return [];
        }
    }
};

// ============================================================
//  EXPORTAR
// ============================================================

window.apiVendas = apiVendas;


// js/api.js - Adicionar MOCK DATA no final do arquivo

// ============================================================
//  MOCK DATA PARA TESTE (SEM BACKEND)
// ============================================================

// Dados mockados para teste
const MOCK_DATA = {
    clientes: [
        { id: 1, nome: 'João Silva', cpf: '111.222.333-44', email: 'joao@email.com', telefone: '(61) 99999-1111', endereco: 'Rua A, 123', ativo: true },
        { id: 2, nome: 'Maria Oliveira', cpf: '222.333.444-55', email: 'maria@email.com', telefone: '(61) 99999-2222', endereco: 'Rua B, 456', ativo: true },
        { id: 3, nome: 'Carlos Santos', cpf: '333.444.555-66', email: 'carlos@email.com', telefone: '(61) 99999-3333', endereco: 'Rua C, 789', ativo: false },
    ],
    produtos: [
        { id: 1, nome: 'One Piece Vol. 100', categoria: 'MANGA', descricao: 'Volume épico da saga Wano', preco: 52.90, estoque: 2, estoqueMinimo: 5, ativo: true },
        { id: 2, nome: 'Duna - Frank Herbert', categoria: 'LIVRO_FICCAO', descricao: 'Edição especial capa dura', preco: 89.90, estoque: 3, estoqueMinimo: 3, ativo: true },
        { id: 3, nome: 'Goku SSJ4 - Banpresto', categoria: 'ACTION_FIGURE', descricao: 'Figure 25cm edição limitada', preco: 320.00, estoque: 1, estoqueMinimo: 2, ativo: true },
        { id: 4, nome: 'Catan', categoria: 'JOGO_TABULEIRO', descricao: 'Jogo de colonização clássico', preco: 219.90, estoque: 8, estoqueMinimo: 3, ativo: true },
        { id: 5, nome: 'Naruto Vol. 72', categoria: 'MANGA', descricao: 'Volume final da saga Naruto', preco: 48.00, estoque: 10, estoqueMinimo: 5, ativo: true },
    ],
    vendas: [
        { id: 1, clienteId: 1, clienteNome: 'João Silva', dataVenda: '2024-01-15T10:30:00', total: 52.90, status: 'FINALIZADA', itens: [{ produtoId: 1, produtoNome: 'One Piece Vol. 100', quantidade: 1, precoUnitario: 52.90, subtotal: 52.90 }] },
        { id: 2, clienteId: 2, clienteNome: 'Maria Oliveira', dataVenda: '2024-01-20T14:20:00', total: 409.90, status: 'FINALIZADA', itens: [{ produtoId: 2, produtoNome: 'Duna - Frank Herbert', quantidade: 1, precoUnitario: 89.90, subtotal: 89.90 }, { produtoId: 4, produtoNome: 'Catan', quantidade: 1, precoUnitario: 219.90, subtotal: 219.90 }] },
        { id: 3, clienteId: 1, clienteNome: 'João Silva', dataVenda: '2024-02-01T09:15:00', total: 320.00, status: 'ABERTA', itens: [{ produtoId: 3, produtoNome: 'Goku SSJ4 - Banpresto', quantidade: 1, precoUnitario: 320.00, subtotal: 320.00 }] },
    ]
};

let nextClienteId = 4;
let nextProdutoId = 6;
let nextVendaId = 4;

// Sobrescrever funções da API com dados mock
const apiClientesMock = {
    listar: async () => MOCK_DATA.clientes,
    buscar: async (id) => MOCK_DATA.clientes.find(c => c.id === id),
    criar: async (cliente) => {
        const novo = { ...cliente, id: nextClienteId++, ativo: true };
        MOCK_DATA.clientes.push(novo);
        return novo;
    },
    atualizar: async (id, cliente) => {
        const index = MOCK_DATA.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            MOCK_DATA.clientes[index] = { ...MOCK_DATA.clientes[index], ...cliente };
            return MOCK_DATA.clientes[index];
        }
        throw new Error('Cliente não encontrado');
    },
    desativar: async (id) => {
        const cliente = MOCK_DATA.clientes.find(c => c.id === id);
        if (cliente) { cliente.ativo = false; return cliente; }
        throw new Error('Cliente não encontrado');
    },
    ativar: async (id) => {
        const cliente = MOCK_DATA.clientes.find(c => c.id === id);
        if (cliente) { cliente.ativo = true; return cliente; }
        throw new Error('Cliente não encontrado');
    },
    deletar: async (id) => {
        const index = MOCK_DATA.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            MOCK_DATA.clientes.splice(index, 1);
            return true;
        }
        throw new Error('Cliente não encontrado');
    },
    pesquisar: async (termo) => {
        return MOCK_DATA.clientes.filter(c => 
            c.nome.toLowerCase().includes(termo.toLowerCase()) ||
            c.cpf.includes(termo)
        );
    }
};

const apiProdutosMock = {
    listar: async () => MOCK_DATA.produtos,
    buscar: async (id) => MOCK_DATA.produtos.find(p => p.id === id),
    criar: async (produto) => {
        const novo = { ...produto, id: nextProdutoId++, ativo: true };
        MOCK_DATA.produtos.push(novo);
        return novo;
    },
    atualizar: async (id, produto) => {
        const index = MOCK_DATA.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            MOCK_DATA.produtos[index] = { ...MOCK_DATA.produtos[index], ...produto };
            return MOCK_DATA.produtos[index];
        }
        throw new Error('Produto não encontrado');
    },
    desativar: async (id) => {
        const produto = MOCK_DATA.produtos.find(p => p.id === id);
        if (produto) { produto.ativo = false; return produto; }
        throw new Error('Produto não encontrado');
    },
    ativar: async (id) => {
        const produto = MOCK_DATA.produtos.find(p => p.id === id);
        if (produto) { produto.ativo = true; return produto; }
        throw new Error('Produto não encontrado');
    },
    deletar: async (id) => {
        const index = MOCK_DATA.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            MOCK_DATA.produtos.splice(index, 1);
            return true;
        }
        throw new Error('Produto não encontrado');
    },
    pesquisar: async (termo, categoria) => {
        return MOCK_DATA.produtos.filter(p => {
            const nomeMatch = p.nome.toLowerCase().includes(termo.toLowerCase());
            const catMatch = !categoria || p.categoria === categoria;
            return nomeMatch && catMatch;
        });
    }
};

const apiVendasMock = {
    listar: async () => MOCK_DATA.vendas,
    buscar: async (id) => MOCK_DATA.vendas.find(v => v.id === id),
    criar: async (venda) => {
        const total = venda.itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0) - (venda.desconto || 0);
        const nova = {
            id: nextVendaId++,
            clienteId: venda.clienteId,
            clienteNome: MOCK_DATA.clientes.find(c => c.id === venda.clienteId)?.nome || 'Cliente',
            dataVenda: new Date().toISOString(),
            total: total,
            status: 'FINALIZADA',
            itens: venda.itens.map(item => ({
                ...item,
                produtoNome: MOCK_DATA.produtos.find(p => p.id === item.produtoId)?.nome || 'Produto',
                subtotal: item.quantidade * item.precoUnitario
            }))
        };
        MOCK_DATA.vendas.push(nova);
        return nova;
    },
    cancelar: async (id) => {
        const venda = MOCK_DATA.vendas.find(v => v.id === id);
        if (venda && venda.status === 'ABERTA') {
            venda.status = 'CANCELADA';
            return venda;
        }
        throw new Error('Venda não pode ser cancelada');
    },
    totalFaturamento: async () => {
        return MOCK_DATA.vendas
            .filter(v => v.status === 'FINALIZADA')
            .reduce((sum, v) => sum + v.total, 0);
    },
    vendasPorMes: async () => {
        const meses = {};
        MOCK_DATA.vendas.forEach(v => {
            const mes = new Date(v.dataVenda).getMonth() + 1;
            meses[mes] = (meses[mes] || 0) + v.total;
        });
        return Object.entries(meses).map(([mes, total]) => ({ mes: parseInt(mes), total }));
    },
    ultimasAtividades: async (limite = 5) => {
        return MOCK_DATA.vendas
            .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
            .slice(0, limite)
            .map(v => ({
                descricao: `Venda #${v.id} - ${v.clienteNome} - R$ ${v.total.toFixed(2)}`,
                data: v.dataVenda
            }));
    }
};

// Substituir as APIs reais pelos mocks
window.apiClientes = apiClientesMock;
window.apiProdutos = apiProdutosMock;
window.apiVendas = apiVendasMock;

console.log('✅ MOCK DATA carregado com sucesso!');