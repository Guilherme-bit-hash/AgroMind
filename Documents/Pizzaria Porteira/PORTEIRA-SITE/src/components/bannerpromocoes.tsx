// src/components/BannerPromocoes.tsx
import { Link } from 'react-router-dom'; // Importação necessária

export default function BannerPromocoes() {
  const promocoes = [
    { id: 1, titulo: '🎁 Primeira Compra', descricao: '10% OFF no seu primeiro pedido', codigo: 'BEMVINDO10' },
    { id: 2, titulo: '📦 Delivery Grátis', descricao: 'Frete grátis acima de R$ 50', codigo: 'FRETEGRATIS' },
    { id: 3, titulo: '🎯 Combo do Dia', descricao: 'Confira nossa promoção especial de hoje!' }
  ]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2D1B00, #4A2F15)',
      borderRadius: '15px',
      padding: '2rem',
      margin: '2rem auto',
      maxWidth: '1200px',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '4px',
        background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6B35)'
      }} />
      
      <h2 style={{
        color: '#FFD700',
        textAlign: 'center',
        fontSize: '2rem',
        marginBottom: '1.5rem'
      }}>
        🎪 Promoções Exclusivas
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {promocoes.map((promo) => (
          <div 
            key={promo.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'translateY(-5px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <h3 style={{
              color: '#FFD700',
              margin: '0 0 10px 0',
              fontSize: '1.4rem'
            }}>
              {promo.titulo}
            </h3>
            <p style={{
              color: '#ccc',
              margin: '0 0 15px 0',
              fontSize: '1rem'
            }}>
              {promo.descricao}
            </p>
            {promo.codigo && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#FFD700',
                padding: '8px 15px',
                borderRadius: '20px',
                border: '1px dashed #FFD700',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
              }}>
                Código: {promo.codigo}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <Link
          to="/cardapio"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#2D1B00',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 215, 0, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          🍕 Ver Cardápio Completo
        </Link>
      </div>
    </div>
  )
}