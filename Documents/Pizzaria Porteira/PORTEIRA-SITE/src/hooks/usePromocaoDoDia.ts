import { useState, useEffect } from 'react'

export interface Promocao {
  nome: string
  descricao: string
  preco: number
  destaque: boolean
  cor: string
  whatsappMessage?: string
  emailSubject?: string
  emailBody?: string
}

const promocoes: Record<number, Promocao> = {
  0: {
    nome: '🍕 Domingo em Família',
    descricao: '2 Pizzas Grandes + Refri 2L por R$ 89,90',
    preco: 89.9,
    destaque: true,
    cor: '#FF6B35',
    whatsappMessage: '🍕 PROMOÇÃO DOMINGO EM FAMÍLIA! 👨‍👩‍👧‍👦\n\n2 Pizzas Grandes + Refri 2L por R$ 89,90\n\nVenha aproveitar esta oferta especial! 😋\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Promoção Domingo em Família - Pizzaria Porteira 🍕',
    emailBody: 'Olá! Este domingo aproveite nossa promoção especial:\n\n2 Pizzas Grandes + Refri 2L por R$ 89,90\n\nIdeall para reunir a família! Aproveite!'
  },
  1: {
    nome: '🎯 Segunda da Pizza',
    descricao: 'Todas as pizzas com 20% OFF',
    preco: 0,
    destaque: true,
    cor: '#4A90E2',
    whatsappMessage: '🍕 SEGUNDA DA PIZZA! 🎯\n\n20% OFF em TODAS as pizzas\n\nNão perca! Aproveite os melhores sabores com desconto especial 🔥\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Segunda da Pizza - 20% OFF em Todas as Pizzas 🍕',
    emailBody: 'Ótima notícia! Toda segunda-feira temos:\n\n20% OFF em TODAS as pizzas\n\nAproveite para experimentar nossos sabores especiais com desconto!'
  },
  2: {
    nome: '🍔 Terça do Hambúrguer',
    descricao: 'Hambúrguer + Batata + Refri por R$ 29,90',
    preco: 29.9,
    destaque: true,
    cor: '#8B4513',
    whatsappMessage: '🍔 TERÇA DO HAMBÚRGUER! 😋\n\nHambúrguer + Batata + Refri por R$ 29,90\n\nNossos hamburgueres são irresistíveis! Aproveite este preço especial 🔥\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Terça do Hambúrguer - Combo Especial 🍔',
    emailBody: 'Toda terça-feira temos a Terça do Hambúrguer:\n\nHambúrguer + Batata + Refri por R$ 29,90\n\nNão deixe de experimentar!'
  },
  3: {
    nome: '🎪 Quarta do Rodízio',
    descricao: 'Rodízio de Pizza por R$ 39,90',
    preco: 39.9,
    destaque: true,
    cor: '#9C27B0',
    whatsappMessage: '🎪 QUARTA DO RODÍZIO! 🍕\n\nRodízio de Pizza por R$ 39,90\n\nVenha experimentar diversos sabores! É festa garantida! 🎉\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Quarta do Rodízio - Rodízio de Pizza 🎪',
    emailBody: 'Toda quarta-feira temos a promoção do Rodízio de Pizza:\n\nRodízio de Pizza por R$ 39,90\n\nVenha com a família e aproveite!'
  },
  4: {
    nome: '🥤 Quinta da Bebida',
    descricao: 'Refrigerante 2L por R$ 8,90',
    preco: 8.9,
    destaque: true,
    cor: '#2196F3',
    whatsappMessage: '🥤 QUINTA DA BEBIDA! 🍹\n\nRefrigerante 2L por R$ 8,90\n\nAcompanhe sua pizza ou hambúrguer com nossas bebidas especiais! 😋\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Quinta da Bebida - Refrigerante com Desconto 🥤',
    emailBody: 'Toda quinta-feira aproveite nossas bebidas em promoção:\n\nRefrigerante 2L por R$ 8,90\n\nPerfecto para acompanhar seus pedidos!'
  },
  5: {
    nome: '🎉 Sexta Feliz',
    descricao: 'Combo Casal: Pizza + 2 Refris por R$ 59,90',
    preco: 59.9,
    destaque: true,
    cor: '#FF9800',
    whatsappMessage: '🎉 SEXTA FELIZ! 💑\n\nCombo Casal: Pizza + 2 Refris por R$ 59,90\n\nBeijo na testa e aproveite nosso combo perfeito! 😘\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Sexta Feliz - Combo Casal Especial 🎉',
    emailBody: 'Toda sexta-feira temos a Sexta Feliz:\n\nCombo Casal: Pizza + 2 Refris por R$ 59,90\n\nPerfecto para começar o fim de semana com a pessoa especial!'
  },
  6: {
    nome: '🌟 Sábado Especial',
    descricao: 'Promoção surpresa! Pergunte no WhatsApp',
    preco: 0,
    destaque: true,
    cor: '#FFD700',
    whatsappMessage: '🌟 SÁBADO ESPECIAL! 🎊\n\nPromoção SURPRESA este sábado! 🎁\n\nEntre em contato conosco e descubra a oferta exclusiva de hoje! 🔥\n\nPizzaria Porteira\n📞 (11) 99999-9999',
    emailSubject: 'Sábado Especial - Promoção Surpresa 🌟',
    emailBody: 'Este sábado temos uma promoção SURPRESA para você!\n\nEntre em contato conosco pelo WhatsApp para descobrir a oferta exclusiva!'
  }
}

export const usePromocaoDoDia = () => {
  const [promocaoAtual, setPromocaoAtual] = useState<Promocao | null>(null)
  const [diaDaSemana, setDiaDaSemana] = useState<number>(0)
  const [nomeDia, setNomeDia] = useState<string>('')

  useEffect(() => {
    const atualizarPromocao = () => {
      const hoje = new Date()
      const dia = hoje.getDay()
      const nomesDias = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado'
      ]

      setDiaDaSemana(dia)
      setNomeDia(nomesDias[dia])
      setPromocaoAtual(promocoes[dia])
    }

    atualizarPromocao()

    // Atualizar a meia-noite
    const agora = new Date()
    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)
    amanha.setHours(0, 0, 0, 0)

    const msAteAmanha = amanha.getTime() - agora.getTime()
    const timeout = setTimeout(() => {
      atualizarPromocao()
      // Configurar para atualizar diariamente
      setInterval(atualizarPromocao, 24 * 60 * 60 * 1000)
    }, msAteAmanha)

    return () => clearTimeout(timeout)
  }, [])

  return {
    promocaoAtual,
    diaDaSemana,
    nomeDia,
    todasAsPromocoes: promocoes
  }
}

// Função para verificar se é o dia correto
export const ehDiaCorreto = (diaSemana: number): boolean => {
  const agora = new Date()
  return agora.getDay() === diaSemana
}
