# 🎓 Equipa - Sistema de Gestão de Equipamentos Escolares

> Sistema web moderno para agendamento e controle de equipamentos tecnológicos em ambientes educacionais.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 🚀 Stack Tecnológica

- **Next.js 15** - Framework React com TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - Modelagem e acesso ao banco de dados
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Query** - Gerenciamento de estado server-side

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.0 ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** 14.0 ou superior ([Download](https://www.postgresql.org/download/))
- **npm** 9.0 ou superior (incluído com Node.js)
- **Git** para controle de versão ([Download](https://git-scm.com/))

## 🔧 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar e adicionar suas credenciais
# Windows: notepad .env.local
# Linux/Mac: nano .env.local
```

Configure a variável `DATABASE_URL` com suas credenciais do PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/equipa_agenda_escola?schema=public"
```

**Importante:** Nunca commite o arquivo `.env.local` no Git!

### 3. Executar migrações do Prisma

```bash
# Criar o banco de dados e as tabelas
npm run db:push

# Gerar o Prisma Client
npm run db:generate
```

### 4. Executar o projeto

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
├── prisma/
│   └── schema.prisma        # Schema do banco de dados
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # Página do painel
│   │   ├── equipamentos/    # Gestão de equipamentos
│   │   ├── agendamento/     # Sistema de reservas
│   │   ├── retiradas/       # Controle de retiradas
│   │   ├── historico/       # Histórico de operações
│   │   ├── usuarios/        # Gestão de usuários
│   │   ├── feedback/        # Feedbacks dos usuários
### Implementadas ✅
- ✅ **Dashboard** - Visão geral com estatísticas e métricas
- ✅ **Gestão de Equipamentos** - CRUD completo com busca e filtros
- ✅ **Sistema de Agendamento** - Calendário interativo para reservas
- ✅ **Interface Responsiva** - Design adaptável para desktop e mobile

### Em Desenvolvimento 🚧
- 🚧 **Controle de Retiradas** - Registro de empréstimos e devoluções
- 🚧 **Histórico Completo** - Auditoria de todas as operações
- 🚧 **Gestão de Usuários** - Cadastro e permissões
- 🚧 **Sistema de Feedback** - Avaliações e sugestões
- 🚧 **Relatórios** - Exportação de dados e analytics

### Planejadas 📝
- 📝 **Notificações** - Lembretes de devoluções e reservas
- 📝 **API REST** - Endpoints para integrações
- 📝 **Autenticação** - Login com NextAuth.js
- 📝 **Multi-tenant** - Suporte a múltiplas escol

## 🎯 Funcionalidades

- ✅ Dashboard com visão geral do sistema
- ✅ Cadastro e gestão de equipamentos
- ✅ Sistema de agendamento com calendário
-  Controle de retiradas e devoluções
-  Histórico de operações
-  Gestão de usuários
-  Sistema de feedback
-  Relatórios e métricas

## 🗄️ Modelos do Banco de Dados

- **User** - Usuários do sistema
- **Equipamento** - Equipamentos disponíveis
- **Agendamento** - Reservas de equipamentos
- **Retirada** - Controle de retiradas/devoluções
- **Feedback** - Feedbacks dos usuários

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm start            # Executar build de produção
npm run lint         # Linter
npm run db:push      # Atualizar schema do banco
npm run db:studio    # Abrir Prisma Studio
npm run db:generate  # Gerar Prisma Client
```

## 🔒 Ambiente de Produção
🤝 Contribuindo

Leia nosso [Guia de Contribuição](CONTRIBUTING.md) para detalhes sobre:

- Padrão de commits (Conventional Commits)
- Processo de Pull Request
- Código de conduta
- Guia de estilo

## 👥 Autores

- **Equipe de Desenvolvimento** - *Trabalho inicial*

Veja também a lista de [contribuidores](../../contributors) que participaram deste projeto.


## 🙏 Agradecimentos

- Shadcn/ui pela biblioteca de componentes
- Comunidade Next.js pelas melhores práticas
- Todos os contribuidores do projeto

---

<p align="center">
  Feito com ❤️ para facilitar a gestão de equipamentos escolares
</p>
- `DATABASE_URL` - URL de conexão com PostgreSQL
- `NODE_ENV=production`

Serviços recomendados:
- **Vercel** - Para o Next.js
- **Supabase / Render / Railway** - Para PostgreSQL

## 📄 Licença

MIT

