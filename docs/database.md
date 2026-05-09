# Banco de Dados

## Modelo de Dados (Prisma Schema)
O banco de dados é relacional (PostgreSQL) e gerenciado pelo Prisma.

### Entidades Principais

#### 1. User (Usuário)
Armazena as credenciais e informações de perfil.
- `id`: CUID (String)
- `email`: Único
- `password`: Hash Bcrypt
- `role`: Enum (ADMIN, PROFESSOR, TECNICO)
- `status`: String ("ativo", "inativo")
- `mustChangePassword`: Boolean (Força troca no primeiro login)

#### 2. Equipamento
Cadastro dos itens disponíveis.
- `nome`, `descricao`, `tipo`
- `status`: ("disponivel", "manutencao", "em_uso")
- `quantidade`: Inteiro
- `localizacao`: String (Sala/Armário)

#### 3. Agendamento
Registra a intenção de uso futuro.
- `userId`: Relacionamento com User
- `equipamentoId`: Relacionamento com Equipamento
- `dataInicio`, `dataFim`
- `status`: ("pendente", "confirmado", "cancelado")

#### 4. Retirada
Controle de movimentação física do equipamento.
- `userId`, `equipamentoId`
- `dataRetirada`, `dataDevolucao`
- `status`: ("AGUARDANDO_RETIRADA", "RETIRADO", "DEVOLVIDO", "ATRASADO")

#### 5. Feedback
Avaliações e report de problemas.
- `userId`, `equipamentoId` (opcional)
- `rating`: 1 a 5
- `mensagem`: Texto
- `status`: ("novo", "lido", "arquivado")

## Relações
- Um **User** pode ter muitos Agendamentos, Retiradas e Feedbacks.
- Um **Equipamento** pode estar presente em muitos Agendamentos, Retiradas e Feedbacks.
- As relações são protegidas por chaves estrangeiras com índices (`@@index`) para performance.

## Enums
- `Role`: `ADMIN`, `PROFESSOR`, `TECNICO`.
