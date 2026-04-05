# Padrão de Commits

Formato: `tipo: descrição curta`

## Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `refactor` | Refatoração sem mudar comportamento |
| `chore` | Manutenção, dependências, configs |

## Exemplos

```bash
feat: adicionar tela de login
feat: criar filtro de equipamentos
fix: corrigir validação do e-mail
docs: atualizar README
refactor: simplificar lógica de agendamento
chore: atualizar dependências
```

## Evite

```bash
# Vago demais
fix: corrige bug
update files

# Sem tipo
adiciona validação

# Longo demais
feat: adiciona funcionalidade complexa que faz validação formatação e integração
```

## Regras

- Use o presente: "adicionar" e não "adicionado"
- Minúsculas após os dois pontos
- Sem ponto final
- Uma frase curta e direta
- Escopo entre parênteses é opcional: `feat(login): ...`
```

Veja mais em [CONTRIBUTING.md](CONTRIBUTING.md)
