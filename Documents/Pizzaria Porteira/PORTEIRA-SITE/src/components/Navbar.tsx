import { useState } from 'react'
import { Link } from 'react-router-dom'

interface NavbarProps {
  logo?: string
  showBackButton?: boolean
  backTo?: string
}

export default function Navbar({ logo = '/logo.jpeg', showBackButton = false, backTo = '/' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: 'rgba(45, 27, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '3px solid rgba(255, 215, 0, 0.3)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        {/* BOTÃO VOLTAR - DESKTOP */}
        {showBackButton && (
          <Link
            to={backTo}
            className="navbar-back-desktop"
            style={{
              display: 'none'
            }}
          >
            ← Voltar
          </Link>
        )}

        {/* LOGO */}
        <div style={{
          width: '120px',
          height: '120px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          animation: 'float 6s ease-in-out infinite'
        }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid rgba(255, 215, 0, 0.6)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)'
            }}
          />
        </div>

        {/* HAMBURGER MENU - MOBILE */}
        <button
          onClick={toggleMenu}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD700',
            fontSize: '1.8rem',
            cursor: 'pointer',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease'
          }}
          className="navbar-hamburger"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* SIDEBAR MOBILE */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '140px',
            left: 0,
            width: '100%',
            background: 'rgba(45, 27, 0, 0.98)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            padding: '20px',
            borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
            animation: 'slideDown 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          className="navbar-sidebar-mobile"
        >
          {showBackButton && (
            <Link
              to={backTo}
              onClick={() => setIsMenuOpen(false)}
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#FFD700',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              ← Voltar
            </Link>
          )}

          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              color: '#FFD700',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              textAlign: 'center',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🏠 Home
          </Link>

          <Link
            to="/cardapio"
            onClick={() => setIsMenuOpen(false)}
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              color: '#FFD700',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              textAlign: 'center',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🍕 Cardápio
          </Link>

          <Link
            to="/sobre"
            onClick={() => setIsMenuOpen(false)}
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              color: '#FFD700',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              textAlign: 'center',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            ℹ️ Sobre
          </Link>

          <Link
            to="/contato"
            onClick={() => setIsMenuOpen(false)}
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              color: '#FFD700',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              textAlign: 'center',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            📞 Contato
          </Link>
        </div>
      )}

      {/* OVERLAY - FECHA MENU AO CLICAR */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '140px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
        />
      )}

      {/* ESTILOS RESPONSIVOS */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-back-desktop {
          display: none;
        }

        .navbar-hamburger {
          display: flex;
        }

        @media (min-width: 768px) {
          .navbar-hamburger {
            display: none !important;
          }

          .navbar-sidebar-mobile {
            display: none !important;
          }

          .navbar-back-desktop {
            display: flex !important;
            background: rgba(255, 215, 0, 0.1);
            color: #FFD700;
            padding: 0.8rem 1.8rem;
            borderRadius: 50px;
            textDecoration: none;
            fontWeight: bold;
            fontSize: 1rem;
            alignItems: center;
            gap: 8px;
            border: 1px solid rgba(255, 215, 0, 0.3);
            transition: all 0.3s ease;
            flex-shrink: 0;
            white-space: nowrap;
          }

          .navbar-back-desktop:hover {
            background: rgba(255, 215, 0, 0.2);
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  )
}
