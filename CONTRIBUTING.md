# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o projeto! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Como Posso Contribuir?](#como-posso-contribuir)
- [Padrão de Commits](#padrão-de-commits)
- [Processo de Pull Request](#processo-de-pull-request)
- [Guia de Estilo](#guia-de-estilo)
- [Estrutura de Branches](#estrutura-de-branches)

## 🚀 Como Posso Contribuir?

### Contribuindo com Código

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. Crie uma **branch** para sua feature
4. **Commit** suas mudanças
5. **Push** para seu fork
6. Abra um **Pull Request**

## 📝 Padrão de Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat(equipamentos): adicionar filtro por status` |
| `fix` | Correção de bug | `fix(dashboard): corrigir cálculo de estatísticas` |
| `docs` | Documentação | `docs(readme): atualizar instruções de instalação` |
| `style` | Formatação, ponto e vírgula, etc | `style(button): ajustar espaçamento` |
| `refactor` | Refatoração de código | `refactor(api): simplificar lógica de validação` |
| `perf` | Melhoria de performance | `perf(query): otimizar consultas ao banco` |
| `test` | Adicionar ou corrigir testes | `test(equipamentos): adicionar testes unitários` |
| `chore` | Tarefas de manutenção | `chore(deps): atualizar dependências` |
| `ci` | Mudanças em CI/CD | `ci(github): adicionar workflow de deploy` |
| `build` | Mudanças no build | `build(webpack): otimizar bundle` |
| `revert` | Reverter commit anterior | `revert: reverter commit abc123` |

### Escopos Sugeridos

- `equipamentos` - Gestão de equipamentos
- `agendamento` - Sistema de agendamento
- `dashboard` - Dashboard
- `usuarios` - Gestão de usuários
- `auth` - Autenticação
- `api` - API REST
- `ui` - Componentes de interface
- `db` - Banco de dados
- `prisma` - Schema Prisma

### Exemplos de Commits

#### ✅ Bons Commits

```bash
feat(equipamentos): adicionar modal de edição
fix(agendamento): corrigir validação de datas conflitantes
docs(contributing): adicionar guia de commits
style(login): ajustar responsividade do formulário
refactor(api): extrair lógica de validação para helpers
perf(dashboard): implementar lazy loading de componentes
test(equipamentos): adicionar testes de CRUD
chore(deps): atualizar next.js para v15.1.6
```

#### ❌ Commits Ruins

```bash
# Muito vago
fix: corrige bug

# Sem tipo
adiciona validação

# Descrição muito longa que não cabe em uma linha e não segue o padrão

# Mistura de idiomas
fix: corrige o validation do form
```

### Breaking Changes

Para mudanças que quebram compatibilidade, adicione `!` após o tipo/escopo:

```bash
feat(api)!: alterar formato de resposta do endpoint /equipamentos

BREAKING CHANGE: O endpoint agora retorna um objeto em vez de array.
Migração: ajustar código que consome este endpoint.
```

### Commits Multi-linha

```bash
feat(agendamento): adicionar sistema de notificações

- Implementar envio de emails de confirmação
- Adicionar lembretes de devolução
- Criar template de email responsivo

Closes #123
```

## 🔄 Processo de Pull Request

### Antes de Abrir um PR

1. ✅ Certifique-se de que o código compila sem erros
2. ✅ Execute o linter: `npm run lint`
3. ✅ Atualize a documentação se necessário
4. ✅ Seu código segue o guia de estilo do projeto

## 🎨 Guia de Estilo

### TypeScript/JavaScript

- Use **TypeScript** para todo código novo
- Prefira **arrow functions** para componentes funcionais
- Use **interfaces** em vez de types quando possível
- Sempre defina **tipos explícitos** para props e estados
- Use **const** em vez de let quando a variável não é reatribuída

```typescript
// ✅ Bom
interface EquipmentProps {
  id: string;
  name: string;
  status: 'disponivel' | 'em_uso' | 'manutencao';
}

const Equipment: React.FC<EquipmentProps> = ({ id, name, status }) => {
  return <div>{name}</div>;
};

// ❌ Evitar
const Equipment = (props: any) => {
  return <div>{props.name}</div>;
};
```

### React/Next.js

- Use **'use client'** apenas quando necessário
- Prefira **Server Components** por padrão
- Componentes em arquivos separados com **PascalCase**
- Hooks personalizados com prefixo **use**
- Mantenha componentes **pequenos e focados**

### CSS/Tailwind

- Use **Tailwind classes** em vez de CSS customizado quando possível
- Para estilos complexos, use **@layer utilities** no globals.css
- Mantenha classes em **ordem lógica**: layout → spacing → sizing → colors → typography
- Use **variáveis CSS** para cores do tema

```tsx
// ✅ Ordem lógica das classes
<div className="flex items-center gap-3 p-4 rounded-lg bg-primary text-white">
  
// ❌ Desordenado
<div className="text-white bg-primary p-4 flex rounded-lg gap-3 items-center">
```

### Prisma

- Use **camelCase** para nomes de modelos
- Adicione **índices** para campos frequentemente consultados
- Sempre adicione **@@index** para foreign keys
- Documente campos complexos com comentários

### Nomenclatura

- **Componentes**: PascalCase - `EquipmentCard.tsx`
- **Hooks**: camelCase com prefixo use - `useEquipment.ts`
- **Utilitários**: camelCase - `formatDate.ts`
- **Constantes**: UPPER_SNAKE_CASE - `MAX_UPLOAD_SIZE`
- **Types/Interfaces**: PascalCase - `Equipment`, `UserRole`

## 🌿 Estrutura de Branches

### Branch Principal

- `main` - Código em produção (protegida)

### Branches de Desenvolvimento

- `dev` - Branch de desenvolvimento (protegida)
- `feat/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatoração
- `test/*` - Testes

### Exemplos de Nomes de Branches

```bash
feat/equipment-filters
fix/dashboard-statistics
docs/api-documentation
refactor/prisma-queries
test/equipment-crud
```

### Fluxo de Trabalho

```
main (produção)
  ↑
dev (desenvolvimento)
  ↑
feat/nova-funcionalidade (sua feature)
```

1. Crie branch a partir de `dev` (ou `main` se não houver `dev`)
2. Desenvolva sua feature
3. Faça commits seguindo o padrão
4. Abra PR para `dev` (ou `main`)
5. Aguarde review e aprovação
6. Merge é feito por mantenedores

## 🎯 Prioridades

Contribuições são especialmente bem-vindas para:
- 🔴 **Alto**: Correção de bugs críticos, segurança
- 🟡 **Médio**: Novas features planejadas, melhorias de UX
- 🟢 **Baixo**: Refatorações, otimizações, documentação

---

**Obrigado por contribuir! 🎉**
