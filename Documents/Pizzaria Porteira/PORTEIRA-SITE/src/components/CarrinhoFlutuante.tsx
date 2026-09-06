// src/components/CarrinhoFlutuante.tsx - VERSÃO MODIFICADA
import { Link } from 'react-router-dom'
import { useCarrinho } from '../contexts/CarrinhoContexts'

export default function CarrinhoFlutuante() {
  const { quantidadeTotal, total } = useCarrinho()

  // REMOVA ESTA LINHA para mostrar sempre:
  // if (quantidadeTotal === 0) return null

  return (
    <Link
      to="/pedido"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: quantidadeTotal === 0 
          ? 'rgba(255, 215, 0, 0.3)' // Mais transparente quando vazio
          : 'linear-gradient(135deg, #FFD700, #FFA500)',
        color: quantidadeTotal === 0 ? 'rgba(45, 27, 0, 0.6)' : '#2D1B00',
        padding: '1rem 1.5rem',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 999,
        boxShadow: quantidadeTotal === 0 
          ? '0 5px 15px rgba(255, 215, 0, 0.2)' 
          : '0 10px 30px rgba(255, 215, 0, 0.4)',
        transition: 'all 0.3s ease',
        border: quantidadeTotal === 0 
          ? '2px solid rgba(255, 215, 0, 0.2)' 
          : '3px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      onMouseEnter={(e) => {
        if (quantidadeTotal === 0) {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 215, 0, 0.3)'
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.4)'
        } else {
          e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.6)'
        }
      }}
      onMouseLeave={(e) => {
        if (quantidadeTotal === 0) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 215, 0, 0.2)'
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)'
        } else {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.4)'
        }
      }}
      title="Ver carrinho de compras"
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        🛒
        {quantidadeTotal > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#FF4444',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white',
            animation: 'pulse 2s infinite'
          }}>
            {quantidadeTotal}
          </span>
        )}
      </div>
      <span>Ver Carrinho</span>
      {quantidadeTotal > 0 ? (
        <span style={{
          background: 'rgba(255, 255, 255, 0.3)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontWeight: 'bold'
        }}>
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      ) : (
        <span style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          Vazio
        </span>
      )}
      
      {/* Estilos para animação */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @media (max-width: 768px) {
          a[style*="bottom: '30px'"] {
            bottom: 20px !important;
            right: 20px !important;
            padding: 0.8rem 1.2rem !important;
            font-size: 0.9rem !important;
          }
        }
        
        @media (max-width: 480px) {
          a[style*="bottom: '30px'"] {
            bottom: 15px !important;
            right: 15px !important;
            padding: 0.7rem 1rem !important;
          }
          
          span:nth-child(2) {
            display: none; /* Esconde "Ver Carrinho" em telas muito pequenas */
          }
        }
      `}</style>
    </Link>
  )
}