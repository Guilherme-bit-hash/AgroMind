# 🎯 Sistema de Toasts de Promoção Semanal

## ✨ O que foi implementado

### 1. **Sistema de Toast Melhorado** (`Toast.tsx`)
- ✅ Toast com animações suaves (slide in/out)
- ✅ Diferentes tipos: success, info, warning, error, promocao
- ✅ Botões de ação integrados: WhatsApp, Email, Copiar
- ✅ Responsivo para mobile
- ✅ Fechar automático ou manual

### 2. **Promoções Diárias** (`usePromocaoDoDia.ts`)
- ✅ Uma promoção diferente para cada dia da semana
- ✅ Mensagens personalizadas para WhatsApp
- ✅ Assunto e corpo personalizados para Email
- ✅ Cores temáticas para cada promoção
- ✅ Atualização automática à meia-noite

### 3. **Toast de Promoção** (`PromocaoDiaToast.tsx`)
- ✅ Mostra automaticamente ao entrar no Cardápio
- ✅ Aparece apenas uma vez por sessão (não fica anoiante)
- ✅ Com botões para compartilhar e adicionar ao carrinho
- ✅ Nunca fecha automaticamente (usuário controla)

### 4. **Integração com WhatsApp e Email**
- ✅ Botão WhatsApp abre conversa pré-preenchida
- ✅ Botão Email solicita email do usuário
- ✅ Botão Copiar copia a mensagem para clipboard
- ✅ Todas as ações têm feedback visual

### 5. **Serviço de Email** (`emailService.ts`)
- ✅ Integração com Formspree (gratuito)
- ✅ Validação de email
- ✅ Tratamento de erros
- ✅ Mensagens de feedback

## 📋 Promoções por Dia

| Dia | Promoção | Preço |
|-----|----------|-------|
| 🟦 Domingo | Domingo em Família: 2 Pizzas + Refri | R$ 89,90 |
| 🟦 Segunda | Segunda da Pizza: 20% OFF em tudo | - |
| 🟦 Terça | Terça do Hambúrguer: Combo | R$ 29,90 |
| 🟦 Quarta | Quarta do Rodízio: Rodízio | R$ 39,90 |
| 🟦 Quinta | Quinta da Bebida: Refri 2L | R$ 8,90 |
| 🟦 Sexta | Sexta Feliz: Combo Casal | R$ 59,90 |
| 🟦 Sábado | Sábado Especial: SURPRESA | - |

## 🚀 Como Funciona

### Quando o usuário abre o Cardápio:
1. O componente `PromocaoDiaToast` verifica o dia atual
2. Se é um dia com promoção, mostra um toast bonito
3. O toast tem 3 opções de compartilhamento:
   - 📱 **WhatsApp**: Abre o WhatsApp com mensagem pré-preenchida
   - ✉️ **Email**: Pede email e envia via Formspree
   - 📋 **Copiar**: Copia a mensagem para compartilhar depois

### Quando adiciona produto ao carrinho:
- Toast verde com emoji 🛒 apareça
- Desaparece automaticamente em 3 segundos

## 🔧 Configuração Necessária

### Passo 1: Configurar Formspree
1. Acesse [formspree.io](https://formspree.io)
2. Crie uma conta
3. Crie um novo formulário
4. Copie o ID do formulário

### Passo 2: Atualizar `emailService.ts`
```typescript
const FORMSPREE_ID = 'seu_id_aqui' // Copie de formspree.io
```

### Passo 3: Atualizar número de WhatsApp
```typescript
// Em emailService.ts
sendWhatsAppMessage(message, '551199999999') // Seu número aqui
```

## 📱 Features por Dispositivo

### Desktop
- ✅ Toast no canto superior direito
- ✅ Todos os botões visíveis
- ✅ Animações suaves
- ✅ Pode deixar aberto enquanto navega

### Tablet
- ✅ Toast responsivo
- ✅ Botões menores mas funcionais
- ✅ Toca para compartilhar

### Mobile
- ✅ Toast adapta a largura
- ✅ Botões em linha única
- ✅ Texto otimizado
- ✅ Fechar com X sempre visível

## 🎨 Customização

### Mudar cores das promoções:
Abra `usePromocaoDoDia.ts` e edite a propriedade `cor`:
```typescript
cor: '#FF6B35' // Laranja
cor: '#4A90E2' // Azul
cor: '#FFD700' // Ouro
```

### Mudar textos:
Edit `usePromocaoDoDia.ts`:
```typescript
nome: '🍕 Novo Nome',
descricao: 'Nova descrição aqui',
whatsappMessage: 'Nova mensagem WhatsApp',
emailSubject: 'Novo assunto',
emailBody: 'Novo corpo do email'
```

### Adicionar novas promoções:
Se quiser promoções especiais em datas:
1. Crie uma nova versão de `usePromocaoDoDia.ts`
2. Adicione verificação por data específica
3. Use `getPromocaoEspecial()` quando necessário

## 🧪 Teste Agora

1. Abra http://localhost:5174/cardapio
2. Veja o toast da promoção aparecer
3. Clique em "WhatsApp" para testar
4. Clique em "Email" e digite seu email
5. Clique em "Copiar" para testar clipboard

## 📊 Monitoramento

### Formspree Dashboard:
- Acesse [formspree.io](https://formspree.io) e veja todos os emails
- Exporte dados em CSV para análise
- Veja os horários das mensagens

### Analytics:
Para rastrear quantos usuários clicam em cada opção:
- Adicione console.log() quando clicam
- Ou integre com Google Analytics

## 🐛 Troubleshooting

### Toast não aparece?
- ✅ Verifique se o `ToastContainer` está em `App.tsx`
- ✅ Abra console (F12) e procure por erros
- ✅ Recarregue a página

### Email não funciona?
- ✅ Verifique o FORMSPREE_ID em `emailService.ts`
- ✅ Confirme a conta no Formspree
- ✅ Teste diretamente em formspree.io

### WhatsApp não abre?
- ✅ Verifique o número (formato: 55 + DDD + número)
- ✅ Teste em https://wa.me/551199999999
- ✅ WhatsApp precisa estar instalado no celular

## 📚 Arquivos Modificados

```
✅ src/components/Toast.tsx (novo)
✅ src/components/PromocaoDiaToast.tsx (novo)
✅ src/components/TabsNavigation.tsx (novo)
✅ src/components/Navbar.tsx (novo)
✅ src/hooks/usePromocaoDoDia.ts (novo)
✅ src/services/emailService.ts (novo)
✅ src/Pages/Cardapio.tsx (atualizado)
✅ src/App.tsx (atualizado)
✅ CONFIG_EMAIL.md (novo - guia setup)
✅ TOAST_PROMOCOES.md (este arquivo)
```

## 🎯 Próximas Melhorias

- [ ] Adicionar integração com Google Analytics
- [ ] Criar dashboard de analytics
- [ ] Adicionar SMS como opção de compartilhamento
- [ ] Permitir agendar promoções futuras
- [ ] Criar admin panel para gerenciar promoções
- [ ] Adicionar suporte a push notifications
