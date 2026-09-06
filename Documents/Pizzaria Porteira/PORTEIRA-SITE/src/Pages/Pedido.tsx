// src/Pages/Pedidos.tsx - VERSÃO COMPLETA
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarrinho } from '../contexts/CarrinhoContexts'
import Navbar from '../components/Navbar'
import PromocaoDiaToast from '../components/PromocaoDiaToast'

export default function Pedidos() {
  const { 
    itens, 
    total, 
    quantidadeTotal, 
    removerItem, 
    atualizarQuantidade,
    limparCarrinho 
  } = useCarrinho()
  
  const [etapa, setEtapa] = useState<'carrinho' | 'entrega'>('carrinho')
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    complemento: '',
    observacoes: ''
  })

  // Se carrinho vazio
  if (quantidadeTotal === 0) {
    return (
      <>
        <Navbar showBackButton={true} backTo="/cardapio" />
        <PromocaoDiaToast />
        <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2D1B00 0%, #3A240F 30%, #4A2F15 60%, #5A3E2B 100%)',
        color: 'white',
        fontFamily: "'Montserrat', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '500px',
          border: '2px solid rgba(255, 215, 0, 0.3)'
        }}>
          <h1 style={{ color: '#FFD700', fontSize: '2.5rem', marginBottom: '1rem' }}>
            🛒 Carrinho Vazio
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc' }}>
            Seu carrinho está vazio. Adicione alguns itens deliciosos!
          </p>
          <Link
            to="/cardapio"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#2D1B00',
              padding: '1rem 2rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Ver Cardápio
          </Link>
        </div>
      </div>
      </>
    )
  }

  // Gerar mensagem do WhatsApp
  const gerarMensagemWhatsApp = () => {
    let mensagem = `*NOVO PEDIDO - PIZZARIA PORTEIRA*%0A%0A`
    mensagem += `*Cliente:* ${dadosCliente.nome}%0A`
    mensagem += `*Telefone:* ${dadosCliente.telefone}%0A`
    mensagem += `*Endereço:* ${dadosCliente.endereco}%0A`
    if (dadosCliente.complemento) {
      mensagem += `*Complemento:* ${dadosCliente.complemento}%0A`
    }
    mensagem += `%0A*ITENS DO PEDIDO:*%0A`
    
    itens.forEach((item, index) => {
      mensagem += `${index + 1}. ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}%0A`
      if (item.observacoes) {
        mensagem += `   Obs: ${item.observacoes}%0A`
      }
    })
    
    mensagem += `%0A*TOTAL: R$ ${total.toFixed(2)}*%0A%0A`
    
    if (dadosCliente.observacoes) {
      mensagem += `*Observações do pedido:*%0A${dadosCliente.observacoes}%0A%0A`
    }
    
    mensagem += `Pedido realizado via Site Pizzaria Porteira`
    
    return mensagem
  }

  // URL do WhatsApp
  const whatsappUrl = `https://wa.me/5511999999999?text=${gerarMensagemWhatsApp()}`

  return (
    <>
      <Navbar showBackButton={true} backTo="/cardapio" />
      <PromocaoDiaToast />
      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2D1B00 0%, #3A240F 30%, #4A2F15 60%, #5A3E2B 100%)',
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
      padding: '20px'
    }}>
      
      {/* CABEÇALHO */}
      <header style={{
        textAlign: 'center',
        marginBottom: '3rem',
        paddingTop: '20px'
      }}>
        <h1 style={{
          color: '#FFD700',
          fontSize: '2.8rem',
          marginBottom: '0.5rem'
        }}>
          {etapa === 'carrinho' ? '🛒 Seu Carrinho' : '📍 Dados de Entrega'}
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginTop: '1rem'
        }}>
          <div style={{
            padding: '8px 20px',
            background: etapa === 'carrinho' ? '#FFD700' : 'rgba(255, 215, 0, 0.2)',
            color: etapa === 'carrinho' ? '#2D1B00' : '#FFD700',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            1. Carrinho
          </div>
          <div style={{ fontSize: '1.5rem' }}>→</div>
          <div style={{
            padding: '8px 20px',
            background: etapa === 'entrega' ? '#FFD700' : 'rgba(255, 215, 0, 0.2)',
            color: etapa === 'entrega' ? '#2D1B00' : '#FFD700',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            2. Entrega
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1000px',
        margin: '0 auto',
        gap: '2rem'
      }}>
        
        {/* ETAPA 1: CARRINHO */}
        {etapa === 'carrinho' && (
          <>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '2rem',
              border: '2px solid rgba(255, 215, 0, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ color: '#FFD700', fontSize: '1.8rem' }}>
                  Itens no Carrinho ({quantidadeTotal})
                </h2>
                <button
                  onClick={limparCarrinho}
                  style={{
                    background: 'rgba(255, 68, 68, 0.2)',
                    color: '#FF8888',
                    border: '1px solid rgba(255, 68, 68, 0.4)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Limpar Tudo
                </button>
              </div>

              {/* LISTA DE ITENS */}
              <div style={{ marginBottom: '2rem' }}>
                {itens.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.2rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{ 
                          color: '#FFD700', 
                          margin: 0, 
                          fontSize: '1.3rem'
                        }}>
                          {item.nome}
                        </h3>
                        <span style={{
                          color: '#FF8C42',
                          fontSize: '1.4rem',
                          fontWeight: 'bold'
                        }}>
                          R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <p style={{ color: '#aaa', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                        {item.descricao}
                      </p>
                      {item.observacoes && (
                        <p style={{ 
                          color: '#FFA500', 
                          margin: 0, 
                          fontSize: '0.85rem',
                          fontStyle: 'italic'
                        }}>
                          <strong>Obs:</strong> {item.observacoes}
                        </p>
                      )}
                    </div>

                    {/* CONTROLES DE QUANTIDADE */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      marginLeft: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '5px 15px',
                        borderRadius: '20px'
                      }}>
                        <button
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </button>
                        
                        <span style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          minWidth: '30px',
                          textAlign: 'center'
                        }}>
                          {item.quantidade}
                        </span>

                        <button
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removerItem(item.id)}
                        style={{
                          background: 'rgba(255, 68, 68, 0.1)',
                          color: '#FF8888',
                          border: '1px solid rgba(255, 68, 68, 0.3)',
                          padding: '8px 15px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* RESUMO */}
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.8rem'
                }}>
                  <span>Subtotal ({quantidadeTotal} itens):</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.8rem'
                }}>
                  <span>Taxa de entrega:</span>
                  <span>Grátis</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#FFD700',
                  paddingTop: '0.8rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={() => setEtapa('entrega')}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#2D1B00',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
              >
                Continuar para Entrega →
              </button>
            </div>

            <Link
              to="/cardapio"
              style={{
                display: 'block',
                textAlign: 'center',
                color: '#FFD700',
                textDecoration: 'none',
                fontSize: '1.1rem',
                padding: '1rem'
              }}
            >
              ← Adicionar mais itens ao carrinho
            </Link>
          </>
        )}

        {/* ETAPA 2: ENTREGA */}
        {etapa === 'entrega' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '2rem',
            border: '2px solid rgba(255, 215, 0, 0.2)'
          }}>
            <h2 style={{ color: '#FFD700', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              📍 Dados para Entrega
            </h2>

            <form style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFD700' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={dadosCliente.nome}
                  onChange={(e) => setDadosCliente({...dadosCliente, nome: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFD700' }}>
                  Telefone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={dadosCliente.telefone}
                  onChange={(e) => setDadosCliente({...dadosCliente, telefone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFD700' }}>
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  required
                  value={dadosCliente.endereco}
                  onChange={(e) => setDadosCliente({...dadosCliente, endereco: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFD700' }}>
                  Complemento
                </label>
                <input
                  type="text"
                  value={dadosCliente.complemento}
                  onChange={(e) => setDadosCliente({...dadosCliente, complemento: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="Apto, bloco, ponto de referência"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFD700' }}>
                  Observações do Pedido
                </label>
                <textarea
                  value={dadosCliente.observacoes}
                  onChange={(e) => setDadosCliente({...dadosCliente, observacoes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Sem cebola, maionese à parte, trocar batata por salada..."
                />
              </div>
            </form>

            {/* RESUMO FINAL */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>
                Resumo do Pedido
              </h3>
              <div style={{ marginBottom: '0.8rem' }}>
                <strong>Itens:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                  {itens.map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.3rem' }}>
                      {item.quantidade}x {item.nome} - R$ {(item.preco * item.quantidade).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#FFD700',
                paddingTop: '0.8rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span>Total a pagar:</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setEtapa('carrinho')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: '200px'
                }}
              >
                ← Voltar ao Carrinho
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  flex: 2,
                  minWidth: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onClick={() => {
                  // Aqui você pode limpar o carrinho após enviar
                  // limparCarrinho()
                }}
              >
                💬 Finalizar Pedido no WhatsApp
              </a>
            </div>

            <p style={{
              textAlign: 'center',
              color: '#aaa',
              fontSize: '0.9rem',
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px'
            }}>
              ⚠️ Ao clicar em "Finalizar Pedido", você será redirecionado para o WhatsApp 
              para confirmar seu pedido e combinar a forma de pagamento.
            </p>
          </div>
        )}
      </div>

      {/* RODAPÉ */}
      <footer style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '2rem',
        color: '#888',
        fontSize: '0.9rem',
        borderTop: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <p>© 2024 Pizzaria Porteira - Sistema de Pedidos</p>
        <p style={{ marginTop: '0.5rem' }}>
          Dúvidas? WhatsApp: (11) 99999-9999
        </p>
      </footer>
      </div>
    </>
  )
}