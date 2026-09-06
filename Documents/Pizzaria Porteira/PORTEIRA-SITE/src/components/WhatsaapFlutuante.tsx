// src/components/WhatsAppFlutuante.tsx
export default function WhatsAppFlutuante() {
  const mensagemPadrao = encodeURIComponent(
    "Olá! Gostaria de fazer um pedido ou tirar uma dúvida sobre o cardápio da Pizzaria Porteira."
  )
  
  return (
    <a
      href={`https://wa.me/5511999999999?text=${mensagemPadrao}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '100px', // Acima do carrinho
        right: '30px',
        background: '#25D366',
        color: 'white',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.5)',
        zIndex: 998,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 211, 102, 0.7)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.5)'
      }}
    >
      💬
    </a>
  )
}