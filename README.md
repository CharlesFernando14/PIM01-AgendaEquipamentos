# 🎓 Equipa - Sistema de Gestão de Equipamentos Escolares

> Sistema web para agendamento e controle de equipamentos tecnológicos em escolas.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Stack

- **Next.js 15** — Framework React com TypeScript
- **PostgreSQL** — Banco de dados relacional
- **Prisma ORM** — Modelagem e acesso ao banco
- **Tailwind CSS** — Estilização
- **Shadcn/ui** — Componentes UI
- **React Query** — Estado server-side

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/download/) 14+
- npm 9+ (incluído com Node.js)
- [Git](https://git-scm.com/)

---

## Passo a passo para rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/CharlesFernando14/PIM01-AgendaEquipamentos.git
cd PIM01-AgendaEquipamentos
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Instalar e configurar o PostgreSQL

Se ainda não tem o PostgreSQL instalado:

1. Baixe o instalador em [enterprisedb.com/downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) (versão 17, Windows x86-64)
2. Durante a instalação:
   - Porta: **5432** (padrão)
   - Senha do superusuário: defina e **anote** (ex: `postgres`)
   - Marque todos os componentes
3. Após instalar, crie o banco de dados:

```bash
# Windows (ajuste o caminho se instalou outra versão)
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE equipa_agenda_escola;"

# Linux/Mac
psql -U postgres -c "CREATE DATABASE equipa_agenda_escola;"
```

> Será solicitada a senha que você definiu na instalação.

### 4. Configurar variáveis de ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env.local   # Linux/Mac
copy .env.example .env.local # Windows

# Também copiar para .env (usado pelo Prisma CLI)
cp .env.local .env           # Linux/Mac
copy .env.local .env         # Windows
```

Abra o `.env.local` e configure com seus dados:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/equipa_agenda_escola?schema=public"
JWT_SECRET="uma-chave-secreta-qualquer"
```

> Substitua `SUA_SENHA` pela senha do PostgreSQL definida na instalação.  
> O arquivo `.env` deve ter o mesmo conteúdo — o Prisma CLI lê apenas esse arquivo.  
> **Nunca commite `.env` ou `.env.local` no Git!**

### 5. Criar as tabelas no banco

```bash
npm run db:push
```

### 6. Gerar o Prisma Client

```bash
npm run db:generate
```

### 7. Popular o banco com usuários iniciais

```bash
npm run db:seed
```

Isso cria os seguintes usuários (senha padrão: **123456**):

| Nome | E-mail | Perfil | Status |
|------|--------|--------|--------|
| Admin Escola | admin@escola.edu.br | Admin | Ativo |
| Maria Silva | maria@escola.edu.br | Professor | Ativo |
| João Santos | joao@escola.edu.br | Professor | Ativo |
| Ana Costa | ana@escola.edu.br | Professor | Ativo |
| Carlos Lima | carlos@escola.edu.br | Professor | Inativo |
| Tech Support | tech@escola.edu.br | Técnico | Ativo |

### 8. Iniciar o servidor

```bash
npm run dev
```

Acesse **http://localhost:3000** e faça login com um dos usuários acima.

---

## Perfis de acesso

Cada perfil vê apenas os módulos permitidos na sidebar:

| Módulo | Admin | Professor | Técnico |
|--------|-------|-----------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Equipamentos | ✅ | ✅ | ✅ |
| Agendamento | ✅ | ✅ | ✅ |
| Retiradas | ✅ | ❌ | ✅ |
| Histórico | ✅ | ✅ | ✅ |
| Relatórios | ✅ | ❌ | ❌ |
| Usuários | ✅ | ❌ | ❌ |
| Feedback | ✅ | ✅ | ✅ |

Após o login, o redirecionamento depende do perfil:
- **Admin** → Dashboard
- **Professor** → Agendamento
- **Técnico** → Equipamentos

---

## Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm start            # Executar build de produção
npm run lint         # Linter
npm run db:push      # Sincronizar schema com o banco
npm run db:generate  # Gerar Prisma Client
npm run db:studio    # Abrir Prisma Studio (interface visual do banco)
npm run db:seed      # Popular banco com dados iniciais
```

---

## Estrutura do projeto

```
├── prisma/
│   ├── schema.prisma         # Schema do banco de dados
│   └── seed.ts               # Script de seed (usuários iniciais)
├── src/
│   ├── app/
│   │   ├── api/auth/         # Rotas de autenticação (login, logout, me)
│   │   ├── login/            # Tela de login
│   │   ├── dashboard/        # Painel de controle
│   │   ├── equipamentos/     # Gestão de equipamentos
│   │   ├── agendamento/      # Sistema de reservas
│   │   ├── retiradas/        # Controle de retiradas
│   │   ├── historico/        # Histórico de operações
│   │   ├── usuarios/         # Gestão de usuários
│   │   ├── feedback/         # Feedbacks
│   │   └── relatorios/       # Relatórios
│   ├── components/           # Componentes reutilizáveis (sidebar, layout, UI)
│   ├── lib/
│   │   ├── auth.ts           # Utilitários JWT e permissões
│   │   ├── auth-context.tsx  # Contexto React de autenticação
│   │   ├── prisma.ts         # Cliente Prisma
│   │   └── utils.ts          # Utilitários gerais
│   └── middleware.ts         # Proteção de rotas e autorização
```

---

## Modelos do banco

- **User** — Usuários com perfil (Admin, Professor, Técnico) e status (ativo/inativo)
- **Equipamento** — Equipamentos cadastrados
- **Agendamento** — Reservas de equipamentos
- **Retirada** — Controle de retiradas e devoluções
- **Feedback** — Feedbacks dos usuários

---

## Funcionalidades

### Implementadas ✅
- Login com e-mail/senha e validação completa
- Autenticação JWT com sessão de 8h
- Controle de acesso por perfil (Admin, Professor, Técnico)
- Dashboard com estatísticas
- CRUD de equipamentos com busca e filtros
- Agendamento com calendário interativo
- Gestão de usuários (Admin)
- Interface responsiva

### Em desenvolvimento 🚧
- Controle de retiradas e devoluções
- Histórico de operações
- Sistema de feedback
- Relatórios e métricas

---

## Produção

Variáveis necessárias:
- `DATABASE_URL` — URL do PostgreSQL
- `JWT_SECRET` — Chave secreta para JWT (use uma chave forte)
- `NODE_ENV=production`

Serviços recomendados:
- **Vercel** — Para o Next.js
- **Supabase / Render / Railway** — Para PostgreSQL

---

## Contribuindo

Leia o [Guia de Contribuição](CONTRIBUTING.md) e a [Convenção de Commits](COMMIT_CONVENTION.md).

---

## Licença

MIT

