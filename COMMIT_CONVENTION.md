# Padrão de Commits - Guia Rápido

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/).

## Formato Básico

```
<tipo>(<escopo>): <descrição>
```

## Tipos Principais

| Tipo | Quando Usar | Exemplo |
|------|-------------|---------|
| `feat` | Nova funcionalidade | `feat(equipamentos): adicionar filtro` |
| `fix` | Correção de bug | `fix(login): corrigir validação` |
| `docs` | Documentação | `docs: atualizar README` |
| `style` | Formatação | `style: ajustar indentação` |
| `refactor` | Refatoração | `refactor: simplificar lógica` |
| `test` | Testes | `test: adicionar teste unitário` |
| `chore` | Manutenção | `chore: atualizar dependências` |

## Exemplos Práticos

### ✅ Bons Commits

```bash
# Nova feature
feat(agendamento): adicionar validação de conflitos

# Bug fix
fix(dashboard): corrigir cálculo de estatísticas

# Documentação
docs(readme): adicionar seção de contribuição

# Estilo
style(button): ajustar padding e margins

# Refatoração
refactor(api): extrair lógica para helpers

# Testes
test(equipamentos): adicionar testes de CRUD

# Manutenção
chore(deps): atualizar next.js para v15.1.6
```

### ❌ Evite

```bash
# Muito vago
fix: corrige bug
update files
changes

# Sem tipo
adiciona validação
corrige problema

# Descrição muito longa
feat: adiciona nova funcionalidade muito complexa que faz várias coisas ao mesmo tempo incluindo validação, formatação e integração com API
```

## Breaking Changes

Para mudanças que quebram compatibilidade:

```bash
feat(api)!: alterar formato de resposta

BREAKING CHANGE: endpoint agora retorna objeto.
```

## Commits Multi-linha

```bash
feat(notificacoes): adicionar sistema de emails

- Implementar envio de confirmações
- Adicionar lembretes de devolução
- Criar templates responsivos

Closes #123
```

## Dicas

- **Presente do indicativo**: "adicionar" não "adicionado"
- **Minúsculas**: depois dos dois pontos
- **Sem ponto final**: na descrição curta
- **Específico**: descreva o "o quê" não o "como"
- **Atômico**: um commit = uma mudança lógica

## Ferramentas Úteis

```bash
# Instalar commitlint (opcional)
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Instalar commitizen para commits interativos (opcional)
npm install --save-dev commitizen
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

Veja mais em [CONTRIBUTING.md](CONTRIBUTING.md)
