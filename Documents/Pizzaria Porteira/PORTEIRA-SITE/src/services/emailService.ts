import { showToast } from '../components/Toast'

// Substitua com seu ID de formulário do Formspree
const FORMSPREE_ID = 'xyzabc123' // Obter em: https://formspree.io/

interface EmailPayload {
  userEmail: string
  subject: string
  body: string
  promoMessage: string
  phone?: string
}

export async function sendPromoEmail(payload: EmailPayload) {
  try {
    // Validar email
    if (!payload.userEmail || !payload.userEmail.includes('@')) {
      showToast({
        message: '❌ Email inválido!',
        type: 'error',
        emoji: '❌'
      })
      return false
    }

    // Opção 1: Usando Formspree (recomendado para frontend puro)
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: payload.userEmail,
        subject: payload.subject,
        message: `${payload.body}\n\nPromoção: ${payload.promoMessage}\n${payload.phone ? `Telefone: ${payload.phone}` : ''}`
      })
    })

    if (response.ok || response.status === 201) {
      showToast({
        message: '✅ Email enviado com sucesso! Confira sua caixa de entrada.',
        type: 'success',
        emoji: '✉️',
        duration: 4000
      })
      return true
    } else {
      showToast({
        message: '❌ Erro ao enviar email. Tente novamente.',
        type: 'error',
        emoji: '❌'
      })
      return false
    }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    showToast({
      message: '❌ Falha na conexão. Verifique sua internet.',
      type: 'error',
      emoji: '❌'
    })
    return false
  }
}

export async function sendWhatsAppMessage(
  message: string,
  phone: string = '5511999999999'
) {
  try {
    const encodedMessage = encodeURIComponent(message)
    // Abrir WhatsApp Web ou App
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'width=600,height=600')

    showToast({
      message: '✅ Abrindo WhatsApp...',
      type: 'success',
      emoji: '📱',
      duration: 2000
    })
    return true
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error)
    showToast({
      message: '❌ Erro ao abrir WhatsApp',
      type: 'error',
      emoji: '❌'
    })
    return false
  }
}

// Função para copiar mensagem para clipboard
export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToast({
      message: '✅ Copiad para clipboard!',
      type: 'success',
      emoji: '📋',
      duration: 2000
    })
    return true
  } catch (error) {
    console.error('Erro ao copiar:', error)
    showToast({
      message: '❌ Erro ao copiar',
      type: 'error',
      emoji: '❌'
    })
    return false
  }
}
