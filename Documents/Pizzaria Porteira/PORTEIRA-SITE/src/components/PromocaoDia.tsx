import { useState } from 'react'

interface Promocao {
  titulo: string
  descricao: string
  cor: string
  emoji: string
  link: string
}

const promocoesPorDia: Promocao[] = [
  {
    titulo: '🍕 Domingo em Família',
    descricao: '2 Pizzas Grandes + Refri 2L por R$ 89,90',
    cor: '#FF6B35',
    emoji: '👨‍👩‍👧‍👦',
    link: '/cardapio?promo=domingo'
  },
  {
    titulo: '🎯 Segunda da Pizza',
    descricao: 'Todas as pizzas com 20% OFF',
    cor: '#4A90E2',
    emoji: '🍕',
    link: '/cardapio?categoria=pizzas'
  },
  {
    titulo: '🍔 Terça do Hambúrguer',
    descricao: 'Hambúrguer + Batata + Refri por R$ 29,90',
    cor: '#8B4513',
    emoji: '🍔',
    link: '/cardapio?categoria=hamburgueres'
  },
  {
    titulo: '🎪 Quarta do Rodízio',
    descricao: 'Rodízio de Pizza por R$ 39,90',
    cor: '#9C27B0',
    emoji: '🎪',
    link: '/cardapio?promo=rodizio'
  },
  {
    titulo: '🥤 Quinta da Bebida',
    descricao: 'Refrigerante 2L por R$ 8,90',
    cor: '#2196F3',
    emoji: '🥤',
    link: '/cardapio?categoria=bebidas'
  },
  {
    titulo: '🎉 Sexta Feliz',
    descricao: 'Combo Casal: Pizza + 2 Refris por R$ 59,90',
    cor: '#FF9800',
    emoji: '🎉',
    link: '/cardapio?promo=sexta'
  },
  {
    titulo: '🌟 Sábado Especial',
    descricao: 'Promoção surpresa! Pergunte no WhatsApp',
    cor: '#FFD700',
    emoji: '🌟',
    link: '/cardapio'
  }
]

const diasDaSemana = [
  'Domingo', 'Segunda-feira', 'Terça-feira',
  'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
]

export default function PromocaoDia() {
  const [isClosed, setIsClosed] = useState(false)
  const hoje = new Date()
  const diaDaSemana = hoje.getDay()
  const promocao = promocoesPorDia[diaDaSemana]
  const nomeDia = diasDaSemana[diaDaSemana]

  if (!promocao || isClosed) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999,
      width: '90%',
      maxWidth: '600px',
      animation: 'slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${promocao.cor}E6 0%, ${promocao.cor}99 100%)`,
          color: 'white',
          padding: '18px 24px',
          borderRadius: '18px',
          textDecoration: 'none',
          boxShadow: `0 15px 40px ${promocao.cor}4D, 0 0 60px ${promocao.cor}1A`,
          border: `2px solid ${promocao.cor}80`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 20px 50px ${promocao.cor}66, 0 0 80px ${promocao.cor}33`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(-50%)'
          e.currentTarget.style.boxShadow = `0 15px 40px ${promocao.cor}4D, 0 0 60px ${promocao.cor}1A`
        }}
      >
        {/* Efeito de luz animado */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `linear-gradient(45deg, transparent, rgba(255,255,255,0.15), transparent)`,
            transform: 'rotate(30deg)',
            animation: 'brilho 4s ease-in-out infinite'
          }}
        />

        {/* Conteúdo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Lado esquerdo */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{promocao.emoji}</span>
              <span
                style={{
                  fontSize: '0.8rem',
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}
              >
                {nomeDia.toUpperCase()}
              </span>
            </div>

            <h3
              style={{
                margin: '8px 0 6px 0',
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
            >
              {promocao.titulo}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                opacity: 0.95,
                lineHeight: '1.3'
              }}
            >
              {promocao.descricao}
            </p>
          </div>

          {/* Lado direito - Ícone animado */}
          <div
            style={{
              fontSize: '2.8rem',
              animation: 'bounce 2.5s ease-in-out infinite',
              flexShrink: 0
            }}
          >
            🔥
          </div>
        </div>

        {/* Badge de horário */}
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: '15px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '3px 10px',
            borderRadius: '0 0 12px 12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            backdropFilter: 'blur(10px)'
          }}
        >
          ⏰ Apenas hoje
        </div>

        {/* Botão fechar */}
        <button
          onClick={() => setIsClosed(true)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Estilos */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-130%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes brilho {
          0% {
            transform: rotate(30deg) translateX(-100%);
          }
          100% {
            transform: rotate(30deg) translateX(100%);
          }
        }

        @media (max-width: 640px) {
          div[style*="display: 'flex'"] {
            flex-direction: column;
            gap: 12px;
          }

          div[style*="font-size: '2.8rem'"] {
            order: -1;
            font-size: 2.3rem;
          }
        }
      `}</style>
    </div>
  )
}