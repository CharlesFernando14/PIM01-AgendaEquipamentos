# 🎓 Equipa - Sistema de Gestão de Equipamentos Escolares

> Sistema web para agendamento e controle de equipamentos tecnológicos em escolas.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Funcionalidades implementadas

### 🔐 Autenticação e Segurança
- Login com e-mail e senha (JWT em cookie httpOnly)
- Troca de senha obrigatória no primeiro acesso
- Troca de senha voluntária pelo menu lateral
- Proteção de rotas por perfil via middleware
- Redirecionamento automático por perfil após login

### 📊 Dashboard
- Cards de resumo: agendamentos do dia, retiradas ativas, equipamentos disponíveis e feedbacks pendentes
- Visão geral das movimentações recentes

### 🖥️ Equipamentos
- Cadastro com nome, tipo, localização, quantidade, status e descrição
- Tipos predefinidos + criação de tipos personalizados ("Outro")
- Tipos customizados ficam disponíveis como opção nas próximas criações
- Lista ordenada alfabeticamente no select de tipo
- Busca por nome ou localização
- Filtro por sala (derivado das localizações cadastradas)
- Filtro por disponibilidade (Disponível / Em uso / Manutenção)
- Ordenação por nome A→Z ou Z→A
- Edição e exclusão (somente Admin e Técnico)

### 📅 Agendamento
- Reserva de equipamentos por período (data/hora início e fim)
- Validação de conflito de horários
- Admin/Técnico pode confirmar ou cancelar agendamentos
- Professor pode cancelar seus próprios agendamentos
- Visualização por dia com navegação de datas

### 📦 Retiradas
- Fluxo Kanban: Aguardando Retirada → Em Uso → Devolvido
- Geração automática de retirada ao confirmar um agendamento
- Registro de data/hora de retirada e devolução

### 📋 Histórico
- Tabela unificada de agendamentos e retiradas
- Busca por equipamento, professor ou finalidade
- Badges coloridos por status

### 📈 Relatórios _(Admin e Técnico)_
- Filtros combinados: tipo (agendamento/retirada), professor, equipamento, intervalo de datas
- Calendário de seleção de datas em português (dd/mm/aaaa)
- Cards de totais: registros, agendamentos, retiradas, professores ativos
- Resumo de status em badges por categoria
- Aba **Agendamentos** — tabela completa com todos os campos
- Aba **Retiradas** — tabela com data de retirada e devolução
- Aba **Por Professor** — ranking com barra proporcional + tabela com contagem separada
- Aba **Por Equipamento** — mesmo formato do ranking por professor
- Exportação em CSV (UTF-8 com BOM) em cada aba

### 👥 Usuários _(Admin)_
- Listagem, criação, edição e desativação de usuários
- Perfis: Admin, Professor, Técnico
- Redefinição de senha pelo administrador

### 💬 Feedback
- Envio de feedbacks categorizados (sugestão, problema, elogio etc.)
- Listagem e mudança de status (Admin/Técnico)

---

## Stack

- **Next.js 15** — Framework React com TypeScript
- **PostgreSQL** — Banco de dados relacional
- **Prisma ORM** — Modelagem e acesso ao banco
- **Tailwind CSS** — Estilização
- **Shadcn/ui** — Componentes UI
- **date-fns** — Formatação e localização de datas (pt-BR)

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
│   ├── schema.prisma                   # Schema do banco de dados (User, Equipamento, Agendamento, Retirada, Feedback)
│   └── seed.ts                         # Script de seed (usuários iniciais)
├── scripts/
│   └── ensure-db.js                    # Garante que o banco existe antes de rodar
├── src/
│   ├── middleware.ts                    # Proteção de rotas e controle de acesso por perfil
│   ├── app/
│   │   ├── layout.tsx                  # Layout raiz (fontes, providers, toaster)
│   │   ├── page.tsx                    # Redireciona para /login ou /dashboard
│   │   ├── globals.css
│   │   ├── login/                      # Tela de login
│   │   ├── change-password/            # Troca de senha obrigatória
│   │   ├── dashboard/                  # Painel com estatísticas
│   │   ├── equipamentos/               # CRUD de equipamentos com filtros e ordenação
│   │   ├── agendamento/                # Reservas de equipamentos por dia
│   │   ├── retiradas/                  # Fluxo Kanban de retiradas
│   │   ├── historico/                  # Histórico unificado de movimentações
│   │   ├── relatorios/                 # Relatórios com filtros, rankings e exportação CSV
│   │   ├── usuarios/                   # Gestão de usuários (Admin)
│   │   ├── feedback/                   # Envio e gestão de feedbacks
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/              # POST — autenticação e geração de JWT
│   │       │   ├── logout/             # POST — limpa o cookie de sessão
│   │       │   ├── me/                 # GET — retorna usuário autenticado
│   │       │   └── change-password/    # POST — troca de senha
│   │       ├── equipamentos/
│   │       │   ├── route.ts            # GET (listagem) · POST (criação)
│   │       │   └── [id]/route.ts       # PUT (edição) · DELETE (exclusão)
│   │       ├── agendamentos/
│   │       │   ├── route.ts            # GET (listagem por data) · POST (criação com validação de conflito)
│   │       │   └── [id]/route.ts       # PUT (confirmar/cancelar) · DELETE
│   │       ├── retiradas/
│   │       │   ├── route.ts            # GET · POST
│   │       │   └── [id]/route.ts       # PUT (avançar status) · DELETE
│   │       ├── historico/              # GET — movimentações unificadas
│   │       ├── relatorios/             # GET — dados com filtros, stats e rankings
│   │       ├── dashboard/              # GET — contadores para os cards
│   │       └── users/
│   │           ├── route.ts            # GET · POST
│   │           └── [id]/route.ts       # PUT · DELETE
│   ├── components/
│   │   ├── AppLayout.tsx               # Layout principal (header + sidebar + conteúdo)
│   │   ├── AppSidebar.tsx              # Sidebar com navegação por perfil e troca de senha
│   │   ├── NavLink.tsx                 # Link de navegação com estado ativo
│   │   ├── StatCard.tsx                # Card de estatística do dashboard
│   │   ├── query-provider.tsx          # Provider do React Query
│   │   └── ui/                         # Componentes Shadcn/ui (Button, Card, Dialog, Table, etc.)
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       ├── auth.ts                     # getSessionUser — leitura e verificação do JWT
│       ├── auth-context.tsx            # Contexto React com user, logout e refresh
│       ├── prisma.ts                   # Singleton do Prisma Client
│       └── utils.ts                    # cn() e utilitários gerais
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
- Relatórios e métricas
- Histórico de operações
- Controle de retiradas e devoluções
- Sistema de feedback

### Em desenvolvimento 🚧

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

