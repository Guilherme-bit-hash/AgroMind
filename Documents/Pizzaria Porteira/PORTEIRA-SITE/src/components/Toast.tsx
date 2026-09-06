import { useState, useEffect } from 'react'
import { sendPromoEmail, sendWhatsAppMessage, copyToClipboard } from '../services/emailService'

export interface ToastProps {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error' | 'promocao'
  duration?: number
  emoji?: string
  onClose?: () => void
  showShareButtons?: boolean
  promoDetails?: {
    whatsappMessage?: string
    emailSubject?: string
    emailBody?: string
  }
}

interface ToastInstance extends ToastProps {
  isExiting?: boolean
}

let toastId = 0
const toasts: Map<string, ToastInstance> = new Map()
const listeners: Set<(toasts: Map<string, ToastInstance>) => void> = new Set()

export const showToast = (props: Omit<ToastProps, 'id'>) => {
  const id = `toast-${toastId++}`
  const toast: ToastInstance = { id, ...props }
  toasts.set(id, toast)
  notifyListeners()

  if (props.duration !== 0) {
    setTimeout(() => removeToast(id), props.duration || 4000)
  }

  return id
}

export const removeToast = (id: string) => {
  const toast = toasts.get(id)
  if (toast) {
    toast.isExiting = true
    notifyListeners()
    setTimeout(() => {
      toasts.delete(id)
      notifyListeners()
    }, 300)
  }
}

const notifyListeners = () => {
  listeners.forEach(listener => listener(new Map(toasts)))
}

export const useToasts = () => {
  const [activeToasts, setActiveToasts] = useState<Map<string, ToastInstance>>(new Map(toasts))

  useEffect(() => {
    listeners.add(setActiveToasts)
    return () => {
      listeners.delete(setActiveToasts)
    }
  }, [])

  return activeToasts
}

export function ToastContainer() {
  const toastList = useToasts()

  const sendWhatsApp = (toast: ToastInstance) => {
    const message = toast.promoDetails?.whatsappMessage || toast.message
    sendWhatsAppMessage(message, '5511999999999') // Substitua pelo número da pizzaria
  }

  const sendEmail = (toast: ToastInstance) => {
    const subject = toast.promoDetails?.emailSubject || 'Promoção Pizzaria Porteira'
    const body = toast.promoDetails?.emailBody || toast.message
    const userEmail = prompt('Digite seu email para receber a promoção:')
    if (userEmail) {
      sendPromoEmail({
        userEmail,
        subject,
        body,
        promoMessage: toast.message
      })
    }
  }

  const handleCopyToClipboard = (text: string) => {
    copyToClipboard(text)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}
    >
      {Array.from(toastList.values()).map((toast) => {
        const bgColors = {
          success: '#4CAF50',
          info: '#2196F3',
          warning: '#FF9800',
          error: '#F44336',
          promocao: '#FFD700'
        }

        const textColors = {
          success: 'white',
          info: 'white',
          warning: 'white',
          error: 'white',
          promocao: '#2D1B00'
        }

        return (
          <div
            key={toast.id}
            style={{
              background: bgColors[toast.type],
              color: textColors[toast.type],
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              animation: toast.isExiting
                ? 'slideOut 0.3s ease forwards'
                : 'slideIn 0.3s ease',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              lineHeight: '1.4'
            }}
          >
            {/* EMOJI */}
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
              {toast.emoji || (toast.type === 'promocao' ? '🎯' : '✓')}
            </span>

            {/* CONTEÚDO */}
            <div style={{ flex: 1 }}>
              <div>{toast.message}</div>

              {/* BOTÕES DE COMPARTILHAMENTO */}
              {toast.showShareButtons && toast.type === 'promocao' && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '10px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => sendWhatsApp(toast)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: textColors[toast.type],
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    📱 WhatsApp
                  </button>

                  <button
                    onClick={() => sendEmail(toast)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: textColors[toast.type],
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    ✉️ Email
                  </button>

                  <button
                    onClick={() => handleCopyToClipboard(toast.promoDetails?.whatsappMessage || toast.message)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: textColors[toast.type],
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    📋 Copiar
                  </button>
                </div>
              )}
            </div>

            {/* BOTÃO FECHAR */}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: textColors[toast.type],
                fontSize: '1.3rem',
                cursor: 'pointer',
                padding: '0',
                opacity: 0.7,
                transition: 'opacity 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7'
              }}
            >
              ✕
            </button>
          </div>
        )
      })}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        @media (max-width: 480px) {
          [style*="position: fixed"] {
            left: 10px !important;
            right: 10px !important;
            max-width: none !important;
            width: auto !important;
          }
        }
      `}</style>
    </div>
  )
}

