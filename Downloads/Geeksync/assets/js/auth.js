// js/auth.js
// Autenticação JWT - Login/Logout

// ============================================================
//  LOGIN
// ============================================================

async function doLogin() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value.trim();

    const errUser = document.getElementById('err-user');
    const errPass = document.getElementById('err-pass');
    const alert = document.getElementById('login-alert');

    // Resetar erros
    document.getElementById('login-user').classList.remove('error');
    document.getElementById('login-pass').classList.remove('error');
    errUser.classList.remove('visible');
    errPass.classList.remove('visible');
    alert.classList.remove('visible');

    let valid = true;

    if (!username) {
        document.getElementById('login-user').classList.add('error');
        errUser.classList.add('visible');
        valid = false;
    }

    if (!password) {
        document.getElementById('login-pass').classList.add('error');
        errPass.classList.add('visible');
        valid = false;
    }

    if (!valid) return;

    // Mostrar loading
    const btnLogin = document.querySelector('.btn-primary');
    const originalText = btnLogin.innerHTML;
    btnLogin.innerHTML = '<i class="bi bi-hourglass-split"></i> Entrando...';
    btnLogin.disabled = true;

    try {
        // 🔥 CHAMADA PARA O BACKEND
        const response = await api.post('/auth/login', {
            username,
            password
        });

        const { token, usuario } = response.data;

        // Salvar token e dados do usuário
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        console.log('✅ Login realizado com sucesso:', usuario.nome);

        // Atualizar UI
        document.getElementById('user-display-name').textContent = usuario.nome;
        document.getElementById('user-display-role').textContent = usuario.perfil;
        document.getElementById('user-avatar').textContent = usuario.nome[0];

        // Trocar para página principal
        document.getElementById('page-login').classList.remove('active');
        document.getElementById('page-app').classList.add('active');

        // Carregar páginas e dados
        if (typeof carregarTodasPaginas === 'function') {
            await carregarTodasPaginas();
        }
        if (typeof carregarDadosIniciais === 'function') {
            await carregarDadosIniciais();
        }

        mostrarToast(`✅ Bem-vindo, ${usuario.nome}!`, 'success');

    } catch (error) {
        console.error('❌ Erro no login:', error);

        alert.classList.add('visible');

        if (error.response?.status === 401) {
            document.getElementById('login-alert-msg').textContent = 'Usuário ou senha inválidos.';
        } else if (error.response?.status === 404) {
            document.getElementById('login-alert-msg').textContent = 'Servidor não encontrado. Verifique se o backend está rodando.';
        } else if (error.code === 'ERR_NETWORK') {
            document.getElementById('login-alert-msg').textContent = 'Erro de conexão. Verifique sua rede.';
        } else {
            document.getElementById('login-alert-msg').textContent = error.response?.data?.message || 'Erro ao realizar login.';
        }

        document.getElementById('login-pass').value = '';
        document.getElementById('login-pass').focus();

    } finally {
        // Restaurar botão
        btnLogin.innerHTML = originalText;
        btnLogin.disabled = false;
    }
}

// ============================================================
//  LOGOUT
// ============================================================

function doLogout() {
    if (!confirm('Tem certeza que deseja sair?')) return;

    localStorage.removeItem('jwt_token');
    localStorage.removeItem('usuario');

    document.getElementById('page-app').classList.remove('active');
    document.getElementById('page-login').classList.add('active');

    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-alert').classList.remove('visible');

    // Limpar dados das páginas
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));

    mostrarToast('🔒 Logout realizado com sucesso', 'info');
}

// ============================================================
//  UTILITÁRIOS DE AUTENTICAÇÃO
// ============================================================

function getUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem('usuario'));
    } catch {
        return null;
    }
}

function getToken() {
    return localStorage.getItem('jwt_token');
}

function isAutenticado() {
    return !!getToken();
}

// ============================================================
//  MODO DE TESTE - SEM BACKEND (opcional)
//  DESCOMENTE O BLOCO ABAIXO PARA TESTAR SEM BACKEND
// ============================================================


// USERS MOCK para teste sem backend
const USERS_MOCK = [
    { username: 'admin', password: '123456', perfil: 'ADMIN', nome: 'Administrador' },
    { username: 'gerente', password: '123456', perfil: 'GERENTE', nome: 'Gerente' },
    { username: 'vendedor', password: '123456', perfil: 'VENDEDOR', nome: 'Vendedor' }
];

// SOBRESCREVER A FUNÇÃO doLogin para modo mock
async function doLogin() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value.trim();

    const errUser = document.getElementById('err-user');
    const errPass = document.getElementById('err-pass');
    const alert = document.getElementById('login-alert');

    document.getElementById('login-user').classList.remove('error');
    document.getElementById('login-pass').classList.remove('error');
    errUser.classList.remove('visible');
    errPass.classList.remove('visible');
    alert.classList.remove('visible');

    let valid = true;
    if (!username) {
        document.getElementById('login-user').classList.add('error');
        errUser.classList.add('visible');
        valid = false;
    }
    if (!password) {
        document.getElementById('login-pass').classList.add('error');
        errPass.classList.add('visible');
        valid = false;
    }
    if (!valid) return;

    const found = USERS_MOCK.find(u => u.username === username && u.password === password);

    if (!found) {
        alert.classList.add('visible');
        document.getElementById('login-alert-msg').textContent = 'Usuário ou senha inválidos.';
        document.getElementById('login-pass').value = '';
        return;
    }

    // Criar token mock
    const token = 'mock_token_' + Date.now();
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('usuario', JSON.stringify(found));

    document.getElementById('user-display-name').textContent = found.nome;
    document.getElementById('user-display-role').textContent = found.perfil;
    document.getElementById('user-avatar').textContent = found.nome[0];

    document.getElementById('page-login').classList.remove('active');
    document.getElementById('page-app').classList.add('active');

    if (typeof carregarTodasPaginas === 'function') {
        await carregarTodasPaginas();
    }
    if (typeof carregarDadosIniciais === 'function') {
        await carregarDadosIniciais();
    }

    mostrarToast(`✅ Bem-vindo, ${found.nome}! (Modo Mock)`, 'success');
}


// ============================================================
//  EXPORTAÇÕES GLOBAIS
// ============================================================

window.doLogin = doLogin;
window.doLogout = doLogout;
window.getUsuarioLogado = getUsuarioLogado;
window.getToken = getToken;
window.isAutenticado = isAutenticado;

console.log('✅ auth.js carregado com sucesso!');