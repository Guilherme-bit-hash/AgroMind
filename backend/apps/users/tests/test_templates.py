# apps/users/tests/test_templates.py
# Python 3.12+ | Django 5.x
#
# Testes unitários focados na renderização dos templates redesenhados.
# Garante que o novo design AgroMind Deep Earth renderiza sem erros
# e exibe os elementos essenciais de UI.

import pytest
from django.urls import reverse
from django.test import override_settings

from apps.users.models import CustomUser
from .factories import AdminFactory, UserFactory


# ===========================================================================
# Fixtures
# ===========================================================================

@pytest.fixture
def usuario(db):
    """Cria e retorna um usuário produtor ativo."""
    return UserFactory()


@pytest.fixture
def admin(db):
    """Cria e retorna um usuário administrador."""
    return AdminFactory()


@pytest.fixture
def cliente_autenticado(client, usuario):
    """Client Django autenticado com usuário produtor."""
    client.force_login(usuario)
    return client


@pytest.fixture
def cliente_admin(client, admin):
    """Client Django autenticado com usuário admin."""
    client.force_login(admin)
    return client


# ===========================================================================
# Template Base — Design System
# ===========================================================================

class TestTemplateBase:
    """Verifica que o template base é herdado corretamente por todas as páginas."""

    def test_login_herda_base_template(self, client, db):
        """A página de login deve conter os elementos do design system Deep Earth."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "AgroMind" in content
        assert "Space Grotesk" in content
        assert "tailwindcss" in content or "tailwind" in content
        assert "Material Symbols" in content or "material-symbols" in content

    def test_register_herda_base_template(self, client, db):
        """A página de cadastro deve conter os elementos do design system."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "AgroMind" in content
        assert "#131313" in content  # Cor de fundo Deep Earth

    def test_dashboard_herda_base_template(self, cliente_autenticado, db):
        """O dashboard deve conter o design system e a sidebar."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "AgroMind" in content
        assert "Rural Intelligence" in content


# ===========================================================================
# Login — Elementos de UI
# ===========================================================================

class TestLoginTemplate:
    """Verifica elementos de UI específicos do template de login."""

    def test_login_exibe_tabs(self, client, db):
        """A página de login deve exibir as tabs Entrar/Cadastrar."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert "Entrar" in content
        assert "Cadastrar" in content

    def test_login_exibe_link_recuperacao(self, client, db):
        """A página de login deve ter o link para recuperação de senha."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert "Esqueceu a senha?" in content
        assert reverse("users:password_reset_request") in content

    def test_login_exibe_visualizacao_bcrypt(self, client, db):
        """O painel esquerdo deve exibir a visualização do BCrypt."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert "BCrypt Hashing Engine" in content
        assert "Bearer Token" in content

    def test_login_exibe_botao_submit(self, client, db):
        """O botão de submit deve ter o texto 'Iniciar Sessão'."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert "Iniciar Sess" in content  # "Iniciar Sessão"

    def test_login_exibe_footer_agromind(self, client, db):
        """O footer deve exibir a marca AgroMind."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert "AGROMIND RURAL" in content

    def test_login_tem_ids_unicos(self, client, db):
        """Elementos interativos devem ter IDs únicos para testes de browser."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert 'id="loginForm"' in content
        assert 'id="btn-login"' in content


# ===========================================================================
# Cadastro — Elementos de UI
# ===========================================================================

class TestRegisterTemplate:
    """Verifica elementos de UI do template de cadastro."""

    def test_register_exibe_tabs(self, client, db):
        """A página de cadastro deve exibir as tabs Entrar/Cadastrar."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert "Entrar" in content
        assert "Cadastrar" in content

    def test_register_exibe_campos(self, client, db):
        """O formulário deve conter todos os campos necessários."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert "Nome Completo" in content
        assert "E-mail" in content
        assert "Senha de Acesso" in content
        assert "Confirme a Senha" in content

    def test_register_exibe_processo_hash(self, client, db):
        """O painel deve exibir o processo de hashing BCrypt."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert "BCrypt SHA256 Engine" in content

    def test_register_exibe_barra_forca_senha(self, client, db):
        """Deve existir a barra de indicação de força da senha."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert 'id="passwordStrength"' in content
        assert 'id="str1"' in content

    def test_register_tem_ids_unicos(self, client, db):
        """Elementos interativos devem ter IDs únicos."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert 'id="registerForm"' in content
        assert 'id="btn-register"' in content

    def test_register_exibe_link_login(self, client, db):
        """A tab Entrar deve linkar para a página de login."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert reverse("users:login") in content


# ===========================================================================
# Dashboard — Elementos de UI
# ===========================================================================

class TestDashboardTemplate:
    """Verifica elementos de UI do dashboard."""

    def test_dashboard_exibe_sidebar(self, cliente_autenticado, db):
        """O dashboard deve exibir a sidebar com módulos."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert "Dashboard" in content
        assert "Propriedades" in content
        assert "Clima" in content
        assert "Financeiro" in content
        assert "Estoque" in content

    def test_dashboard_exibe_boas_vindas(self, cliente_autenticado, usuario, db):
        """Deve exibir mensagem de boas-vindas com o nome do usuário."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert usuario.name in content
        assert "Bem-vindo" in content

    def test_dashboard_exibe_commodity_ticker(self, cliente_autenticado, db):
        """Deve exibir o ticker de commodities."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert "SOJA" in content
        assert "MILHO" in content

    def test_dashboard_exibe_botao_logout(self, cliente_autenticado, db):
        """Deve ter o botão de logout funcional."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert reverse("users:logout") in content
        assert "Sair" in content

    def test_dashboard_nao_mostra_usuarios_para_produtor(self, cliente_autenticado, db):
        """Produtor não deve ver o link de gestão de usuários na sidebar."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert reverse("users:user_list") not in content

    def test_dashboard_mostra_usuarios_para_admin(self, cliente_admin, db):
        """Admin deve ver o link de gestão de usuários na sidebar."""
        response = cliente_admin.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert reverse("users:user_list") in content

    def test_dashboard_tem_id_logout(self, cliente_autenticado, db):
        """O botão de logout deve ter ID único."""
        response = cliente_autenticado.get(reverse("users:dashboard"))
        content = response.content.decode()

        assert 'id="btn-logout"' in content


# ===========================================================================
# Recuperação de Senha — Elementos de UI
# ===========================================================================

class TestPasswordResetRequestTemplate:
    """Verifica elementos de UI da recuperação de senha."""

    def test_exibe_formulario(self, client, db):
        """Deve exibir o formulário de recuperação com o design AgroMind."""
        response = client.get(reverse("users:password_reset_request"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "Recuperar Senha" in content
        assert "AgroMind" in content

    def test_exibe_link_voltar_login(self, client, db):
        """Deve ter link para voltar ao login."""
        response = client.get(reverse("users:password_reset_request"))
        content = response.content.decode()

        assert reverse("users:login") in content


# ===========================================================================
# Páginas de Status — Elementos de UI
# ===========================================================================

class TestPasswordResetDoneTemplate:
    """Verifica a página de senha redefinida."""

    def test_exibe_mensagem_sucesso(self, client, db):
        """Deve exibir mensagem de sucesso."""
        response = client.get(reverse("users:password_reset_done"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "Senha Redefinida" in content
        assert "check_circle" in content
        assert reverse("users:login") in content


# ===========================================================================
# Admin Templates — Restrição de acesso
# ===========================================================================

class TestAdminTemplates:
    """Verifica os templates de admin."""

    def test_user_list_acessivel_por_admin(self, cliente_admin, db):
        """Admin deve conseguir acessar a lista de usuários."""
        response = cliente_admin.get(reverse("users:user_list"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "Lista de" in content

    def test_user_list_redireciona_produtor(self, cliente_autenticado, db):
        """Produtor deve ser redirecionado ao tentar acessar lista de usuários."""
        response = cliente_autenticado.get(reverse("users:user_list"))

        assert response.status_code == 302
        assert "dashboard" in response["Location"]

    def test_user_create_acessivel_por_admin(self, cliente_admin, db):
        """Admin deve conseguir acessar o formulário de criação."""
        response = cliente_admin.get(reverse("users:user_create"))
        content = response.content.decode()

        assert response.status_code == 200
        assert "Novo Usu" in content  # "Novo Usuário"
        assert 'id="btn-create-user"' in content

    def test_user_create_redireciona_produtor(self, cliente_autenticado, db):
        """Produtor deve ser redirecionado ao tentar criar usuário."""
        response = cliente_autenticado.get(reverse("users:user_create"))

        assert response.status_code == 302

    def test_user_list_exibe_botao_novo(self, cliente_admin, db):
        """A lista deve ter o botão de novo usuário."""
        response = cliente_admin.get(reverse("users:user_list"))
        content = response.content.decode()

        assert 'id="btn-new-user"' in content
        assert reverse("users:user_create") in content


# ===========================================================================
# Fluxo de Navegação Funcional
# ===========================================================================

class TestFluxoNavegacao:
    """Testa que os botões e links funcionam e navegam corretamente."""

    def test_cadastro_redireciona_para_login(self, client, db):
        """Após cadastro com sucesso, deve redirecionar para /login/."""
        response = client.post(reverse("users:register"), {
            "name":      "Novo Agricultor",
            "email":     "novo@agromind.com.br",
            "password1": "AgriSafe@2024",
            "password2": "AgriSafe@2024",
        })

        assert response.status_code == 302
        assert reverse("users:login") in response["Location"]

    def test_login_redireciona_para_dashboard(self, client, usuario, db):
        """Após login com sucesso, deve redirecionar para /dashboard/."""
        response = client.post(reverse("users:login"), {
            "email":    usuario.email,
            "password": "Teste@1234",
        })

        assert response.status_code == 302
        assert "dashboard" in response["Location"]

    def test_logout_redireciona_para_login(self, cliente_autenticado, db):
        """Após logout, deve redirecionar para /login/."""
        response = cliente_autenticado.post(reverse("users:logout"))

        assert response.status_code == 302
        assert "login" in response["Location"]

    def test_dashboard_sem_auth_redireciona_login(self, client, db):
        """Dashboard sem autenticação deve redirecionar para login."""
        response = client.get(reverse("users:dashboard"))

        assert response.status_code == 302
        assert "login" in response["Location"]


# ===========================================================================
# Loader e Animações — Presença nos Templates
# ===========================================================================

class TestLoaderAnimacoes:
    """Verifica que os elementos de animação estão presentes."""

    def test_login_tem_loader(self, client, db):
        """A página de login deve conter o page loader."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert 'id="pageLoader"' in content
        assert "seed-icon" in content

    def test_login_tem_animacoes_css(self, client, db):
        """As animações CSS devem estar presentes no base template."""
        response = client.get(reverse("users:login"))
        content = response.content.decode()

        assert "fadeInUp" in content
        assert "animate-fade-in-up" in content

    def test_register_tem_animacao_hash(self, client, db):
        """O cadastro deve ter a animação de hash BCrypt."""
        response = client.get(reverse("users:register"))
        content = response.content.decode()

        assert 'id="registerHash"' in content
        assert 'id="hashProgress"' in content
