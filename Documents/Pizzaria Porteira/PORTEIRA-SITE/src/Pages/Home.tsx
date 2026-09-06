// src/Pages/Home.tsx - LANDING PAGE
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <main
      style={{
        // REMOVI position: fixed
        height: '100vh',
        backgroundImage: "url('/fundo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* OVERLAY ESCURO */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)'
        }}
      />

      {/* CONTEÚDO */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '2rem',
          width: '100%',
          maxWidth: '800px'
        }}
      >
        {/* LOGO */}
        <img
          src="/logo.jpeg"
          alt="Logo Pizzaria Porteira"
          className="logo-animada"
          style={{
            width: 'clamp(200px, 40vw, 400px)',
            height: 'clamp(200px, 40vw, 400px)',
            objectFit: 'cover',
            borderRadius: '50%',
            margin: '0 auto 2rem',
            boxShadow: '0 20px 40px rgba(255, 238, 88, 0.6)',
            display: 'block'
          }}
        />

        {/* BOTÃO COM LINK DO REACT ROUTER */}
        <Link
          to="/cardapio"
          style={{
            backgroundColor: isHovered ? '#6d4c3a' : '#5a3e2b',
            color: '#ffffffff',
            padding: '1.2rem 3rem',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            boxShadow: isHovered 
              ? '0 20px 40px rgba(255, 215, 0, 0.8)' 
              : '0 10px 30px rgba(255, 215, 0, 0.6)',
            transition: 'all 0.3s ease',
            display: 'inline-block',
            marginTop: '1rem'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Ver Cardápio
        </Link>

        {/* TEXTO PULSANTE */}
        <div
          style={{
            marginTop: '2rem',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            animation: 'pulse 2s infinite'
          }}
        >
          ↓ Clique para explorar nosso cardápio ↓
        </div>
      </div>

      {/* ESTILOS INLINE */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .logo-animada {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </main>
  )
}