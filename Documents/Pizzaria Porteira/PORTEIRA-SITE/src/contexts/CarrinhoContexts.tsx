// src/contexts/CarrinhoContext.tsx - VERSÃO CORRIGIDA
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type ItemCarrinho = {
  id: string
  nome: string
  descricao: string
  preco: number
  quantidade: number
  categoria: 'pizza' | 'hamburguer' | 'bebida' | 'sobremesa' | 'promocao'
  observacoes?: string
}

type CarrinhoContextType = {
  itens: ItemCarrinho[]
  total: number
  quantidadeTotal: number
  adicionarItem: (item: Omit<ItemCarrinho, 'id' | 'quantidade'>) => void
  removerItem: (id: string) => void
  atualizarQuantidade: (id: string, quantidade: number) => void
  adicionarObservacao: (id: string, observacoes: string) => void
  limparCarrinho: () => void
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined)

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext)
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider')
  }
  return context
}

export const CarrinhoProvider = ({ children }: { children: ReactNode }) => {
  const [itens, setItens] = useState<ItemCarrinho[]>([])

  const gerarId = () => Math.random().toString(36).substr(2, 9)

  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

  const quantidadeTotal = itens.reduce((acc, item) => acc + item.quantidade, 0)

  const adicionarItem = (item: Omit<ItemCarrinho, 'id' | 'quantidade'>) => {
    setItens(prev => {
      const itemExistenteIndex = prev.findIndex(
        i => i.nome === item.nome && i.observacoes === item.observacoes
      )

      if (itemExistenteIndex !== -1) {
        const novosItens = [...prev]
        novosItens[itemExistenteIndex].quantidade += 1
        return novosItens
      } else {
        return [...prev, { ...item, id: gerarId(), quantidade: 1 }]
      }
    })
  }

  const removerItem = (id: string) => {
    setItens(prev => prev.filter(item => item.id !== id))
  }

  const atualizarQuantidade = (id: string, quantidade: number) => {
    if (quantidade < 1) {
      removerItem(id)
      return
    }

    setItens(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantidade } : item
      )
    )
  }

  const adicionarObservacao = (id: string, observacoes: string) => {
    setItens(prev =>
      prev.map(item =>
        item.id === id ? { ...item, observacoes } : item
      )
    )
  }

  const limparCarrinho = () => {
    setItens([])
  }

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        total,
        quantidadeTotal,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        adicionarObservacao,
        limparCarrinho
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}