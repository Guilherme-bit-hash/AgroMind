# Configuração de Envio de Email e WhatsApp

## 📧 Configurar Envio de Email com Formspree

### Passo 1: Criar conta no Formspree
1. Acesse [formspree.io](https://formspree.io)
2. Faça login com sua conta Google ou crie uma nova conta
3. Clique em "+ New Form"
4. Dê um nome ao formulário (ex: "Pizzaria Porteira Promoções")
5. Escolha o email para receber as mensagens (pode ser qualquer email)
6. Clique em "Create"

### Passo 2: Copiar o ID do formulário
Você receberá um código como `xyzabc123` após criar o formulário. Este é o seu **FORMSPREE_ID**.

### Passo 3: Atualizar o arquivo `emailService.ts`
Abra `src/services/emailService.ts` e substitua:
```typescript
const FORMSPREE_ID = 'xyzabc123' // Seu ID aqui
```

Pelo seu ID real, por exemplo:
```typescript
const FORMSPREE_ID = 'xoqpewml' // Exemplo
```

## 📱 Configurar WhatsApp

### Para Mudar o Número de WhatsApp
Abra `src/services/emailService.ts` e procure por:
```typescript
sendWhatsAppMessage(message, '5511999999999') // Substitua aqui
```

Mude para o número correto da sua pizzaria:
- Formato: `55` (código do Brasil) + `11` (DDD) + `99999999` (número)
- Exemplo: `5511987654321`

## 🔧 Alternativas de Email

Se preferir usar outro serviço:

### EmailJS (Mais simples)
1. Acesse [emailjs.com](https://www.emailjs.com)
2. Crie uma conta
3. Configure seu serviço de email (Gmail, Outlook, etc)
4. Copie a Service ID, Template ID e Public Key
5. Atualize `emailService.ts`

### SendGrid (Mais profissional)
1. Acesse [sendgrid.com](https://sendgrid.com)
2. Crie uma conta
3. Gere uma API Key
4. Configure em `emailService.ts`

## 🧪 Testar a Integração

### Testar Email:
1. Abra o Cardápio no seu navegador
2. Quando aparecer o toast da promoção, clique em "✉️ Email"
3. Digite seu email no prompt
4. Verifique se recebeu o email

### Testar WhatsApp:
1. Clique em "📱 WhatsApp" no toast
2. Será aberto o WhatsApp Web ou App
3. Verifique se a mensagem aparece corretamente

### Testar Copiar:
1. Clique em "📋 Copiar" 
2. Cole em qualquer lugar para verificar se copiou

## 📊 Monitorar Emails Recebidos

### Formspree:
- Acesse seu painel em formspree.io
- Você verá todos os emails recebidos em tempo real
- Pode exportar dados em CSV

## ⚙️ Configuração Avançada

### Customizar Mensagens de Promoção
Abra `src/hooks/usePromocaoDoDia.ts` e edite as mensagens em cada dia:

```typescript
const promocoes: Record<number, Promocao> = {
  0: { // Domingo
    nome: '🍕 Domingo em Família',
    descricao: '2 Pizzas Grandes + Refri 2L por R$ 89,90',
    whatsappMessage: 'Seu texto aqui',
    emailSubject: 'Seu assunto aqui',
    emailBody: 'Seu corpo aqui'
  }
  // ... outros dias
}
```

### Temas e Cores das Promoções
Customize as cores em cada promoção:
```typescript
cor: '#FFD700' // Mude a cor em hex
```

## 🆘 Troubleshooting

### Email não é enviado:
- ✅ Verifique o FORMSPREE_ID
- ✅ Confirme a conta no Formspree (check seu email)
- ✅ Teste em formspree.io diretamente

### WhatsApp não abre:
- ✅ Verifique o número (com código do país)
- ✅ Abra https://wa.me/5511999999999 (com seu número)
- ✅ Pode ser que precise instalar WhatsApp Web

### Toast não aparece:
- ✅ Abra o Console (F12) e veja se há erros
- ✅ Verifique se o ToastContainer está em App.tsx
- ✅ Recarregue a página
