// src/Pages/Cardapio.tsx - VERSÃO COMPLETA ATUALIZADA
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCarrinho } from '../contexts/CarrinhoContexts'
import Navbar from '../components/Navbar'
import TabsNavigation from '../components/TabsNavigation'
import PromocaoDiaToast from '../components/PromocaoDiaToast'
import { usePromocaoDoDia } from '../hooks/usePromocaoDoDia'
import { showToast } from '../components/Toast'

type TabType = 'pizzas' | 'hamburgueres' | 'bebidas' | 'sobremesas' | 'promocoes'

// Função para gerar imagens placeholder dinâmicas
const getPlaceholderImage = (nome: string, categoria: TabType) => {
  const cores = {
    pizzas: 'FF6B35',
    hamburgueres: '8B4513', 
    bebidas: '4A90E2',
    sobremesas: 'C2185B',
    promocoes: 'FFD700'
  }
  
  const emojis = {
    pizzas: '🍕',
    hamburgueres: '🍔',
    bebidas: '🥤',
    sobremesas: '🍰',
    promocoes: '🎯'
  }
  
  const texto = encodeURIComponent(`${emojis[categoria]} ${nome}`)
  return `https://placehold.co/600x400/${cores[categoria]}/white?text=${texto}&font=montserrat`
}

// Dados do cardápio com URLs de imagens
const cardapio = {
  pizzas: [
    { 
      nome: 'Mussarela', 
      descricao: 'Mussarela, molho de tomate, orégano', 
      preco: 32.9,
      imagem: getPlaceholderImage('Mussarela', 'pizzas')
    },
    { 
      nome: 'Portuguesa', 
      descricao: 'Presunto, ovo, cebola, pimentão, azeitonas, mussarela', 
      preco: 39.9,
      imagem: getPlaceholderImage('Portuguesa', 'pizzas')
    },
    { 
      nome: 'Calabresa', 
      descricao: 'Calabresa, cebola, mussarela, orégano', 
      preco: 34.9,
      imagem: getPlaceholderImage('Calabresa', 'pizzas')
    },
    { 
      nome: 'Frango com Catupiry', 
      descricao: 'Frango desfiado, Catupiry, milho, mussarela', 
      preco: 42.9,
      imagem: getPlaceholderImage('Frango Catupiry', 'pizzas')
    },
    { 
      nome: 'Margherita', 
      descricao: 'Mussarela, tomate, manjericão, azeite', 
      preco: 35.9,
      imagem: getPlaceholderImage('Margherita', 'pizzas')
    },
    { 
      nome: '4 Queijos', 
      descricao: 'Mussarela, provolone, parmesão, gorgonzola', 
      preco: 44.9,
      imagem: getPlaceholderImage('4 Queijos', 'pizzas')
    }
  ],
  hamburgueres: [
    { 
      nome: 'Clássico', 
      descricao: 'Carne 150g, queijo, alface, tomate, maionese', 
      preco: 26.9,
      imagem: getPlaceholderImage('Hambúrguer Clássico', 'hamburgueres')
    },
    { 
      nome: 'Porteira', 
      descricao: 'Carne 180g, bacon, cheddar, cebola caramelizada', 
      preco: 29.9,
      imagem: getPlaceholderImage('Hambúrguer Porteira', 'hamburgueres')
    },
    { 
      nome: 'Double Bacon', 
      descricao: '2 carnes, bacon extra, queijo cheddar, molho especial', 
      preco: 34.9,
      imagem: getPlaceholderImage('Double Bacon', 'hamburgueres')
    },
    { 
      nome: 'Vegetariano', 
      descricao: 'Hambúrguer de grão de bico, queijo, alface, tomate', 
      preco: 28.9,
      imagem: getPlaceholderImage('Vegetariano', 'hamburgueres')
    }
  ],
  bebidas: [
    { 
      nome: 'Refrigerante lata', 
      descricao: 'Coca-Cola, Guaraná, Fanta Laranja, Sprite', 
      preco: 6,
      imagem: getPlaceholderImage('Refrigerante', 'bebidas')
    },
    { 
      nome: 'Suco natural', 
      descricao: 'Laranja, limão, maracujá, abacaxi com hortelã', 
      preco: 8,
      imagem: getPlaceholderImage('Suco Natural', 'bebidas')
    },
    { 
      nome: 'Água mineral', 
      descricao: 'Água com/sem gás 500ml', 
      preco: 4,
      imagem: getPlaceholderImage('Água', 'bebidas')
    },
    { 
      nome: 'Cerveja artesanal', 
      descricao: 'IPA, Pilsen, Weiss 500ml', 
      preco: 12,
      imagem: getPlaceholderImage('Cerveja', 'bebidas')
    }
  ],
  sobremesas: [
    { 
      nome: 'Pudim', 
      descricao: 'Pudim de leite condensado tradicional', 
      preco: 12,
      imagem: getPlaceholderImage('Pudim', 'sobremesas')
    },
    { 
      nome: 'Mousse de chocolate', 
      descricao: 'Chocolate meio amargo com raspas de chocolate', 
      preco: 10,
      imagem: getPlaceholderImage('Mousse', 'sobremesas')
    },
    { 
      nome: 'Brownie com sorvete', 
      descricao: 'Brownie quente com bola de sorvete de creme', 
      preco: 16,
      imagem: getPlaceholderImage('Brownie', 'sobremesas')
    },
    { 
      nome: 'Cheesecake', 
      descricao: 'Cheesecake de frutas vermelhas', 
      preco: 14,
      imagem: getPlaceholderImage('Cheesecake', 'sobremesas')
    }
  ],
  promocoes: [
    { 
      nome: 'Pizza + Refri 2L', 
      descricao: 'Pizza média + refrigerante 2 litros', 
      preco: 59.9,
      imagem: getPlaceholderImage('Pizza + Refri', 'promocoes')
    },
    { 
      nome: 'Combo Família', 
      descricao: '2 pizzas grandes + 2 refrigerantes 2L', 
      preco: 99.9,
      imagem: getPlaceholderImage('Combo Família', 'promocoes')
    },
    { 
      nome: 'Hambúrguer + Batata', 
      descricao: 'Hambúrguer + porção de batata frita + refri lata', 
      preco: 34.9,
      imagem: getPlaceholderImage('Combo Hamburguer', 'promocoes')
    }
  ]
}

const abas: { id: TabType; label: string; icon: string }[] = [
  { id: 'pizzas', label: 'Pizzas', icon: '🍕' },
  { id: 'hamburgueres', label: 'Hambúrgueres', icon: '🍔' },
  { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
  { id: 'sobremesas', label: 'Sobremesas', icon: '🍰' },
  { id: 'promocoes', label: 'Promoção do Dia', icon: '🎯' }
]

export default function Cardapio() {
  const [abaAtiva, setAbaAtiva] = useState<TabType>('pizzas')
  const { adicionarItem } = useCarrinho()
  const { promocaoAtual, nomeDia, todasAsPromocoes } = usePromocaoDoDia()

  const promocaoDoDia = promocaoAtual
  const nomeDiaAtual = nomeDia

  // Mapear categorias para o contexto
  const categoriaMap = {
    pizzas: 'pizza',
    hamburgueres: 'hamburguer',
    bebidas: 'bebida',
    sobremesas: 'sobremesa',
    promocoes: 'promocao'
  } as const

  // Função para adicionar ao carrinho
  const handleAdicionarAoCarrinho = (item: typeof cardapio.pizzas[0]) => {
    adicionarItem({
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      categoria: categoriaMap[abaAtiva]
    })

    // Feedback visual com novo sistema de Toast
    showToast({
      message: `${item.nome} adicionado ao carrinho!`,
      type: 'success',
      emoji: '🛒',
      duration: 3000
    })
  }

  // Remove scroll horizontal e bordas
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden'
    document.body.style.overflowX = 'hidden'
    document.documentElement.style.margin = '0'
    document.body.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.body.style.padding = '0'
    
    return () => {
      document.documentElement.style.overflowX = ''
      document.body.style.overflowX = ''
      document.documentElement.style.margin = ''
      document.body.style.margin = ''
      document.documentElement.style.padding = ''
      document.body.style.padding = ''
    }
  }, [])

  if (!promocaoDoDia) return null

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2D1B00 0%, #3A240F 30%, #4A2F15 60%, #5A3E2B 100%)',
      backgroundAttachment: 'fixed',
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
      margin: 0,
      padding: 0,
      width: '100%',
      overflowX: 'hidden'
    }}>

      {/* TOAST DE PROMOÇÃO DO DIA */}
      <PromocaoDiaToast />

      {/* NAVBAR RESPONSIVA */}
      <Navbar showBackButton={true} backTo="/" />

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{
        paddingTop: '180px',
        paddingBottom: '40px',
        width: '100%',
        margin: 0
      }}>

        {/* TÍTULO E DESCRIÇÃO */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '0 20px'
        }}>
          <h1 style={{
            color: '#FFD700',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            Nosso Cardápio
          </h1>
          <p style={{
            color: '#ccc',
            fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Deliciosas opções feitas com ingredientes selecionados.
            Clique nas abas para explorar nosso menu completo!
          </p>
        </div>

        {/* ABAS RESPONSIVAS */}
        <TabsNavigation tabs={abas} activeTab={abaAtiva} onTabChange={setAbaAtiva} />

        {/* SEÇÃO DA PROMOÇÃO DO DIA (APENAS NA ABA PROMOÇÕES) */}
        {abaAtiva === 'promocoes' && (
          <div style={{
            maxWidth: '900px',
            margin: '0 auto 3rem auto',
            padding: '0 20px'
          }}>
            {/* BANNER PRINCIPAL DA PROMOÇÃO DO DIA */}
            <div style={{
              background: `linear-gradient(135deg, ${promocaoDoDia.cor}, ${promocaoDoDia.cor}CC, #2D1B00)`,
              borderRadius: '25px',
              padding: '2.5rem',
              border: '4px solid rgba(255, 215, 0, 0.6)',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '3rem'
            }}>
              {/* EFEITO DE BRILHO */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                transform: 'rotate(30deg)',
                animation: 'brilho 3s infinite'
              }} />
              
              {/* CABEÇALHO DA PROMOÇÃO */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                position: 'relative',
                zIndex: 2
              }}>
                <span style={{ fontSize: '3.5rem' }}>
                  {promocaoDoDia.nome.split(' ')[0]}
                </span>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '0.8rem 2rem',
                  borderRadius: '30px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  {nomeDiaAtual}
                </div>
              </div>
              
              {/* TÍTULO DA PROMOÇÃO */}
              <h2 style={{
                color: '#FFD700',
                fontSize: '2.5rem',
                marginBottom: '1rem',
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                position: 'relative',
                zIndex: 2
              }}>
                {promocaoDoDia.nome}
              </h2>
              
              {/* DESCRIÇÃO */}
              <p style={{
                color: 'white',
                fontSize: '1.5rem',
                marginBottom: '2rem',
                opacity: 0.95,
                maxWidth: '700px',
                margin: '0 auto 2rem auto',
                lineHeight: '1.6',
                position: 'relative',
                zIndex: 2
              }}>
                {promocaoDoDia.descricao}
              </p>
              
              {/* PREÇO OU MENSAGEM ESPECIAL */}
              {promocaoDoDia.preco > 0 ? (
                <div style={{
                  fontSize: '3.5rem',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  textShadow: '3px 3px 8px rgba(0,0,0,0.7)',
                  position: 'relative',
                  zIndex: 2,
                  background: 'rgba(0, 0, 0, 0.3)',
                  display: 'inline-block',
                  padding: '1rem 3rem',
                  borderRadius: '20px',
                  border: '3px solid rgba(255, 215, 0, 0.4)'
                }}>
                  R$ {promocaoDoDia.preco.toFixed(2).replace('.', ',')}
                </div>
              ) : (
                <div style={{
                  fontSize: '2rem',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  position: 'relative',
                  zIndex: 2,
                  background: 'rgba(255, 215, 0, 0.2)',
                  padding: '1rem 2rem',
                  borderRadius: '15px',
                  border: '2px solid rgba(255, 215, 0, 0.4)'
                }}>
                  🎁 Preço especial no dia!
                </div>
              )}
              
              {/* BADGES */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                marginTop: '2rem',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 2
              }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.8rem 1.8rem',
                  borderRadius: '25px',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⏰ Válido apenas hoje
                </span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.8rem 1.8rem',
                  borderRadius: '25px',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔥 Mais vendido
                </span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.8rem 1.8rem',
                  borderRadius: '25px',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⭐ 4.8/5.0
                </span>
              </div>
              
              {/* BOTÃO DE AÇÃO */}
              <div style={{
                marginTop: '2.5rem',
                position: 'relative',
                zIndex: 2
              }}>
                <button
                  onClick={() => {
                    adicionarItem({
                      nome: promocaoDoDia.nome,
                      descricao: promocaoDoDia.descricao,
                      preco: promocaoDoDia.preco > 0 ? promocaoDoDia.preco : 0,
                      categoria: 'promocao'
                    })

                    // Feedback visual com novo sistema
                    showToast({
                      message: `${promocaoDoDia.nome} adicionada ao carrinho!`,
                      type: 'success',
                      emoji: '🎉',
                      duration: 3000
                    })
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#2D1B00',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '1.2rem 3.5rem',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.6)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.6)'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🛒</span>
                  Adicionar Promoção ao Carrinho
                </button>
              </div>
            </div>

            {/* TODAS AS PROMOÇÕES DA SEMANA */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '2.5rem',
              border: '2px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h3 style={{
                color: '#FFD700',
                fontSize: '2rem',
                textAlign: 'center',
                marginBottom: '2.5rem'
              }}>
                📅 Promoções da Semana
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {[
                  { dia: 'Domingo', promocao: '2 Pizzas + Refri 2L por R$ 89,90', emoji: '👨‍👩‍👧‍👦', cor: '#FF6B35' },
                  { dia: 'Segunda', promocao: '20% OFF em todas as pizzas', emoji: '🎯', cor: '#4A90E2' },
                  { dia: 'Terça', promocao: 'Hambúrguer + Batata + Refri R$ 29,90', emoji: '🍔', cor: '#8B4513' },
                  { dia: 'Quarta', promocao: 'Rodízio de Pizza R$ 39,90', emoji: '🎪', cor: '#9C27B0' },
                  { dia: 'Quinta', promocao: 'Refri 2L por R$ 8,90', emoji: '🥤', cor: '#2196F3' },
                  { dia: 'Sexta', promocao: 'Combo Casal R$ 59,90', emoji: '🎉', cor: '#FF9800' },
                  { dia: 'Sábado', promocao: 'Promoção surpresa!', emoji: '🌟', cor: '#FFD700' }
                ].map((item, index) => {
                  const hoje = new Date().getDay()
                  return (
                    <div 
                      key={item.dia}
                      style={{
                        background: index === hoje 
                          ? `linear-gradient(135deg, ${item.cor}, ${item.cor}66)` 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: index === hoje 
                          ? '3px solid #FFD700' 
                          : '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '15px',
                        padding: '1.8rem',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => {
                        // Se clicar em um dia futuro, mostra mensagem
                        if (index !== hoje) {
                          alert(`Esta promoção estará disponível na ${item.dia}!`)
                        }
                      }}
                    >
                      {index === hoje && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#FF4444',
                          color: 'white',
                          fontSize: '0.8rem',
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontWeight: 'bold',
                          zIndex: 2,
                          animation: 'pulse 2s infinite'
                        }}>
                          HOJE
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.2rem',
                        marginBottom: '1.2rem'
                      }}>
                        <span style={{ 
                          fontSize: '2.5rem',
                          filter: index === hoje ? 'none' : 'opacity(0.8)'
                        }}>
                          {item.emoji}
                        </span>
                        <div>
                          <div style={{
                            fontWeight: 'bold',
                            color: index === hoje ? '#FFD700' : '#FFA500',
                            fontSize: '1.3rem'
                          }}>
                            {item.dia}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: index === hoje ? 'white' : 'rgba(255, 255, 255, 0.7)'
                          }}>
                            {index === hoje ? 'Promoção ativa!' : 'Aguardando...'}
                          </div>
                        </div>
                      </div>
                      <p style={{ 
                        color: index === hoje ? 'white' : '#ccc', 
                        margin: 0,
                        fontSize: '1.1rem',
                        lineHeight: '1.5'
                      }}>
                        {item.promocao}
                      </p>
                      
                      {index === hoje && (
                        <div style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.9rem',
                            color: '#FFD700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            ⏰ Disponível agora
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              adicionarItem({
                                nome: `${item.dia} - ${item.promocao.split(' por')[0]}`,
                                descricao: item.promocao,
                                preco: item.promocao.includes('R$') 
                                  ? parseFloat(item.promocao.match(/R\$ (\d+[,.]\d+)/)?.[1].replace(',', '.') || '0')
                                  : 0,
                                categoria: 'promocao'
                              })
                            }}
                            style={{
                              background: 'rgba(255, 215, 0, 0.2)',
                              color: '#FFD700',
                              border: '1px solid rgba(255, 215, 0, 0.4)',
                              padding: '6px 15px',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Adicionar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO NORMAL PARA OUTRAS ABAS */}
        {abaAtiva !== 'promocoes' && (
          <>
            {/* CONTADOR DE ITENS */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#FFD700',
              fontSize: '1.2rem'
            }}>
              {cardapio[abaAtiva].length} {abaAtiva === 'pizzas' ? 'sabores de pizza' : 
                abaAtiva === 'hamburgueres' ? 'tipos de hambúrguer' :
                abaAtiva === 'bebidas' ? 'bebidas disponíveis' :
                abaAtiva === 'sobremesas' ? 'sobremesas deliciosas' : 'combos especiais'}
            </div>

            {/* LISTA DE ITENS COM IMAGENS */}
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 20px 4rem 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '2.5rem',
              width: '100%'
            }}>
              {cardapio[abaAtiva].map((item) => (
                <div 
                  key={item.nome}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.transform = 'translateY(-10px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* IMAGEM DO PRODUTO */}
                  <div style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={item.imagem}
                      alt={item.nome}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                    
                    {/* OVERLAY GRADIENTE */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(to top, rgba(45, 27, 0, 0.8), transparent)'
                    }} />
                    
                    {/* BADGE DE CATEGORIA */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      background: 'rgba(255, 215, 0, 0.9)',
                      color: '#2D1B00',
                      padding: '6px 18px',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                      {abaAtiva === 'pizzas' ? '🍕 Pizza' :
                       abaAtiva === 'hamburgueres' ? '🍔 Lanche' :
                       abaAtiva === 'bebidas' ? '🥤 Bebida' :
                       abaAtiva === 'sobremesas' ? '🍰 Sobremesa' : '🎯 Combo'}
                    </div>
                  </div>

                  {/* INFORMAÇÕES DO PRODUTO */}
                  <div style={{
                    padding: '1.8rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1.2rem'
                    }}>
                      <div>
                        <h3 style={{ 
                          color: '#FFD700', 
                          fontSize: '1.6rem',
                          margin: '0 0 8px 0',
                          fontWeight: 'bold'
                        }}>
                          {item.nome}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '5px'
                        }}>
                          <span style={{
                            color: '#FF8C42',
                            fontSize: '0.9rem',
                            background: 'rgba(255, 140, 66, 0.1)',
                            padding: '4px 10px',
                            borderRadius: '15px',
                            border: '1px solid rgba(255, 140, 66, 0.3)'
                          }}>
                            ⭐ 4.8
                          </span>
                          <span style={{
                            color: '#4CAF50',
                            fontSize: '0.9rem',
                            background: 'rgba(76, 175, 80, 0.1)',
                            padding: '4px 10px',
                            borderRadius: '15px',
                            border: '1px solid rgba(76, 175, 80, 0.3)'
                          }}>
                            🚀 15-25 min
                          </span>
                        </div>
                      </div>
                      
                      <span style={{
                        color: '#FF8C42',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '12px',
                        minWidth: '110px',
                        textAlign: 'center',
                        border: '2px solid rgba(255, 140, 66, 0.2)'
                      }}>
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    {item.descricao && (
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        margin: 0,
                        lineHeight: '1.6',
                        fontSize: '1rem',
                        flex: 1,
                        marginBottom: '1.8rem'
                      }}>
                        {item.descricao}
                      </p>
                    )}

                    {/* BOTÃO ADICIONAR AO CARRINHO */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAdicionarAoCarrinho(item)
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        color: '#2D1B00',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 25px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                        width: '100%',
                        marginTop: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)'
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.7)'
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FFE44D, #FFB347)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)'
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)'
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>🛒</span>
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SEÇÃO DE DESTAQUE (APENAS PARA ABAS NÃO-PROMOÇÕES) */}
        {abaAtiva !== 'promocoes' && (
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '20px',
            padding: '2.5rem',
            margin: '3rem auto',
            maxWidth: '1200px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#FFD700', fontSize: '2rem', marginBottom: '1rem' }}>
              🎯 Dica do Chefe
            </h2>
            <p style={{ color: '#ccc', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Experimente nossa <strong>Pizza Portuguesa</strong> acompanhada de um 
              <strong> suco natural de laranja</strong>. Combinação perfeita!
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px 20px',
                borderRadius: '25px',
                color: '#FFD700'
              }}>
                🕒 Entrega 30 min
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px 20px',
                borderRadius: '25px',
                color: '#FFD700'
              }}>
                💳 Aceitamos todos cartões
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px 20px',
                borderRadius: '25px',
                color: '#FFD700'
              }}>
                🎁 10% off no primeiro pedido
              </span>
            </div>
          </div>
        )}

        {/* RODAPÉ */}
        <footer style={{
          textAlign: 'center',
          padding: '3rem 20px',
          background: 'rgba(45, 27, 0, 0.95)',
          borderTop: '4px solid #FFD700',
          backdropFilter: 'blur(20px)',
          marginTop: '3rem',
          width: '100%'
        }}>
          <img
            src="/logo.jpeg"
            alt="Logo Porteira"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '3px solid rgba(255, 215, 0, 0.6)',
              marginBottom: '1rem'
            }}
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0', fontSize: '1.1rem' }}>
            📞 (11) 99999-9999
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0', fontSize: '1.1rem' }}>
            📍 Rua da Pizzaria, 123 - Centro
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0 1.5rem 0', fontSize: '1.1rem' }}>
            ⏰ 18h às 23h • Todos os dias
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <a href="#" style={{ color: '#FFD700', fontSize: '1.5rem' }}>📱</a>
            <a href="#" style={{ color: '#FFD700', fontSize: '1.5rem' }}>📸</a>
            <a href="#" style={{ color: '#FFD700', fontSize: '1.5rem' }}>📘</a>
            <a href="#" style={{ color: '#FFD700', fontSize: '1.5rem' }}>🐦</a>
          </div>
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#2D1B00',
              padding: '1rem 3rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 215, 0, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 215, 0, 0.4)'
            }}
          >
            Voltar para Home
          </Link>
        </footer>
      </div>

      {/* ESTILOS INLINE */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-8px); 
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes brilho {
          0% { transform: rotate(30deg) translateX(-100%); }
          100% { transform: rotate(30deg) translateX(100%); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        /* REMOVE TODAS AS BORDAS/ESPACAMENTOS GLOBAIS */
        * {
          box-sizing: border-box;
        }
        
        /* RESPONSIVIDADE */
        @media (max-width: 1024px) {
          .lista {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
            gap: 2rem !important;
          }
        }
        
        @media (max-width: 768px) {
          header {
            padding: 12px 15px !important;
          }
          
          header > div:nth-child(1) {
            width: 100px !important;
            height: 100px !important;
          }
          
          div[style*="paddingTop: '170px'"] {
            padding-top: 130px !important;
          }
          
          h1 {
            font-size: 2.5rem !important;
          }
          
          button[style*="min-width: '180px'"] {
            min-width: 150px !important;
            padding: 0.8rem 1.2rem !important;
            font-size: 1rem !important;
          }
          
          .lista {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 1.5rem !important;
          }
          
          div[style*="height: '220px'"] {
            height: 200px !important;
          }
          
          footer img {
            width: 80px !important;
            height: 80px !important;
          }
          
          /* Ajustes para promoções mobile */
          div[style*="font-size: '3.5rem'"] {
            font-size: 2.5rem !important;
          }
          
          div[style*="font-size: '2.5rem'"] {
            font-size: 2rem !important;
          }
        }
        
        @media (max-width: 480px) {
          header > div:nth-child(1) {
            width: 80px !important;
            height: 80px !important;
          }
          
          div[style*="paddingTop: '170px'"] {
            padding-top: 110px !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
          
          button[style*="min-width: '180px'"] {
            min-width: 130px !important;
            padding: 0.7rem 1rem !important;
            font-size: 0.9rem !important;
          }
          
          .lista {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          div[style*="height: '220px'"] {
            height: 180px !important;
          }
          
          h3 {
            font-size: 1.4rem !important;
          }
          
          span[style*="font-size: '2rem'"] {
            font-size: 1.8rem !important;
          }
          
          /* Ajustes para promoções mobile pequeno */
          div[style*="font-size: '3.5rem'"] {
            font-size: 2rem !important;
          }
          
          div[style*="font-size: '2.5rem'"] {
            font-size: 1.8rem !important;
          }
          
          div[style*="font-size: '1.5rem'"] {
            font-size: 1.3rem !important;
          }
        }
      `}</style>
      
    </main>
    
  )
  
}
