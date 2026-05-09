# Controle de Acesso e Permissões

## Perfis de Usuário (Roles)
O sistema possui três níveis de permissão definidos no enum `Role`.

### 1. ADMIN (Administrador)
Possui acesso total ao sistema.
- Gerenciamento de Usuários (Criar, Editar, Desativar).
- Gestão completa de Equipamentos.
- Acesso a Relatórios Gerenciais e Auditoria.
- Visualização de todos os Feedbacks.
- Controle total de Agendamentos e Retiradas.

### 2. TECNICO (Técnico/Funcionário de TI)
Focado na operação e manutenção.
- Gestão de Equipamentos (Status, Localização).
- Controle de Retiradas e Devoluções (Realizar o "check-out" e "check-in").
- Visualização de Agendamentos.
- Reportar problemas em equipamentos.

### 3. PROFESSOR (Docente)
Focado no uso dos recursos.
- Visualizar equipamentos disponíveis.
- Realizar, editar e cancelar seus próprios Agendamentos.
- Consultar seu histórico de uso.
- Enviar feedbacks sobre equipamentos utilizados.

## Aplicação das Permissões

### No Backend (API)
Cada endpoint deve verificar o `session.role` antes de processar operações sensíveis.
```typescript
if (session.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
}
```

### No Frontend (Interface)
O `AppSidebar` e componentes de ação utilizam o objeto de usuário da sessão para esconder ou desabilitar elementos.
- Links do menu não permitidos não são renderizados.
- Botões de "Excluir" ou "Editar" são ocultados para perfis sem permissão.

## Matriz de Acesso por Rota
| Rota | ADMIN | TECNICO | PROFESSOR |
| :--- | :---: | :---: | :---: |
| /dashboard | ✅ | ✅ | ✅ |
| /equipamentos | ✅ | ✅ | ✅ (Vista) |
| /agendamento | ✅ | ✅ | ✅ |
| /retiradas | ✅ | ✅ | ❌ |
| /historico | ✅ | ✅ | ✅ |
| /usuarios | ✅ | ❌ | ❌ |
| /relatorios | ✅ | ❌ | ❌ |
| /feedback | ✅ | ✅ | ✅ |
