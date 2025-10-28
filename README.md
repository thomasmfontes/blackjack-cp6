# 🃏 Blackjack Game - CP6

Um simulador de Blackjack desenvolvido em Next.js com design simples e funcional.

## 📋 Funcionalidades

- **Sistema de Login**: Autenticação simples para acesso ao jogo
- **Jogo de Blackjack**: Implementação completa das regras do blackjack
- **Interface Limpa**: Design minimalista e responsivo
- **API Integration**: Integração com Deck of Cards API
- **Proteção de Rotas**: Sistema de autenticação para proteger páginas

## 🚀 Como Executar

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd blackjack-21
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:3000
   ```

## 🎮 Como Jogar

1. Faça login na página inicial
2. Clique em "Nova Rodada" para começar
3. Use "Hit" para pedir mais cartas
4. Use "Stand" para parar e deixar o dealer jogar
5. Tente chegar o mais próximo de 21 sem ultrapassar!

## 🛠 Tecnologias Utilizadas

- **Next.js 14**: Framework React para desenvolvimento web
- **TypeScript**: Linguagem tipada baseada em JavaScript
- **Deck of Cards API**: API externa para gerenciamento de cartas
- **CSS Modules**: Estilização com CSS puro

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/            # Rotas da API
│   ├── blackjack/      # Página do jogo
│   ├── login/          # Página de login
│   └── globals.css     # Estilos globais
├── components/
│   ├── Header.tsx      # Cabeçalho da aplicação
│   └── Protected.tsx   # Componente de proteção de rotas
└── lib/
    ├── score.ts        # Lógica de pontuação
    └── types.ts        # Definições de tipos
```

## 🎯 Regras do Blackjack

- **Objetivo**: Chegar o mais próximo de 21 sem ultrapassar
- **Valores das cartas**: 
  - Números: valor da face
  - J, Q, K: 10 pontos
  - Ás: 1 ou 11 pontos (o que for melhor)
- **Blackjack**: 21 com as duas primeiras cartas
- **Bust**: Ultrapassar 21 pontos (você perde)

## 👥 Créditos

Projeto desenvolvido para o CP6 da disciplina de HTML/CSS da FIAP.

## 📄 Licença

Este projeto é para fins educacionais.