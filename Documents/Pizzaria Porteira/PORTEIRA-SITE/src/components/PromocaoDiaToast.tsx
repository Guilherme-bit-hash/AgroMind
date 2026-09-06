import { useEffect } from 'react'
import { usePromocaoDoDia } from '../hooks/usePromocaoDoDia'
import { showToast } from './Toast'

export default function PromocaoDiaToast() {
  const { promocaoAtual, nomeDia } = usePromocaoDoDia()

  useEffect(() => {
    if (promocaoAtual) {
      // Mostrar toast apenas uma vez por sessão
      const toastMostrado = sessionStorage.getItem('promocao-toast-mostrado')
      if (!toastMostrado) {
        // Aguardar um pouco para a página carregar completamente
        const timer = setTimeout(() => {
          showToast({
            message: `${promocaoAtual.nome}\n${promocaoAtual.descricao}`,
            type: 'promocao',
            emoji: promocaoAtual.nome.split(' ')[0],
            duration: 0, // Não fecha automaticamente
            showShareButtons: true,
            promoDetails: {
              whatsappMessage: promocaoAtual.whatsappMessage,
              emailSubject: promocaoAtual.emailSubject,
              emailBody: promocaoAtual.emailBody
            }
          })

          sessionStorage.setItem('promocao-toast-mostrado', 'true')
        }, 800)

        return () => clearTimeout(timer)
      }
    }
  }, [promocaoAtual])

  // Este componente não renderiza nada visualmente
  return null
}
