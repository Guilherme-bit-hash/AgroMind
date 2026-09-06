// src/App.tsx - VERSÃO CORRIGIDA
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CarrinhoProvider } from './contexts/CarrinhoContexts'
import CarrinhoFlutuante from './components/CarrinhoFlutuante'
import WhatsAppFlutuante from './components/WhatsaapFlutuante'
import { ToastContainer } from './components/Toast'
import Navbar from './components/Navbar'
import PromocaoDiaToast from './components/PromocaoDiaToast'
import Home from './Pages/Home'
import Cardapio from './Pages/Cardapio'
import Pedido from './Pages/Pedido'

// Importação de estilos
import './styles/App.css'

function App() {
  return (
    <CarrinhoProvider>
      <BrowserRouter>
        {/* Toast Container */}
        <ToastContainer />

        {/* Todos componentes dentro da estrutura principal */}
        <div className="app-container">
          {/* Conteúdo Principal com Rotas */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cardapio" element={<Cardapio />} />
            <Route path="/pedido" element={<Pedido />} />
            
            {/* Páginas adicionais */}
            <Route path="/promocoes" element={
              <>
                <Navbar showBackButton={true} backTo="/" />
                <PromocaoDiaToast />
                <div className="page-container" style={{ paddingTop: '180px', minHeight: '100vh' }}>
                  <h1 className="page-title">🎪 Promoções Exclusivas</h1>
                  <p className="page-subtitle">Aproveite nossas ofertas especiais!</p>
                  {/* Aqui você pode adicionar o BannerPromocoes */}
                </div>
              </>
            } />

            <Route path="/sobre" element={
              <>
                <Navbar showBackButton={true} backTo="/" />
                <PromocaoDiaToast />
                <div className="page-container" style={{ paddingTop: '180px', minHeight: '100vh' }}>
                  <h1 className="page-title">ℹ️ Sobre a Pizzaria Porteira</h1>
                  <div className="sobre-content">
                    <p>
                      Há mais de 15 anos, a <strong>Pizzaria Porteira</strong> traz o melhor
                      da tradição italiana com um toque brasileiro. Nossas pizzas são feitas
                      com ingredientes selecionados e massa preparada artesanalmente todos os dias.
                    </p>
                  </div>
                </div>
              </>
            } />

            <Route path="/contato" element={
              <>
                <Navbar showBackButton={true} backTo="/" />
                <PromocaoDiaToast />
                <div className="page-container" style={{ paddingTop: '180px', minHeight: '100vh' }}>
                  <h1 className="page-title">📞 Entre em Contato</h1>
                  <div className="contato-info">
                    <p>WhatsApp: (11) 99999-9999</p>
                    <p>Telefone: (11) 9999-9998</p>
                    <p>Endereço: Rua das Pizzas, 123 - Centro, São Paulo, SP</p>
                  </div>
                </div>
              </>
            } />
          </Routes>
          
          {/* Componentes Flutuantes */}
          <WhatsAppFlutuante />
          <CarrinhoFlutuante />
        </div>
      </BrowserRouter>
    </CarrinhoProvider>
  )
}

export default App