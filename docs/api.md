# Documentação da API

## Autenticação

### `POST /api/auth/login`
Realiza a autenticação e cria a sessão.
- **Body:** `{ "email": "...", "password": "..." }`
- **Resposta (200):** `{ "user": { ... }, "redirectTo": "..." }`
- **Erros:** 400 (Faltam dados), 401 (Credenciais inválidas).

### `POST /api/auth/logout`
Encerra a sessão atual.

### `POST /api/auth/change-password`
Altera a senha do usuário logado.

---

## Equipamentos

### `GET /api/equipamentos`
Lista todos os equipamentos.

### `POST /api/equipamentos`
Cadastra um novo equipamento.
- **Permissão:** ADMIN, TECNICO.

### `GET /api/equipamentos/[id]`
Obtém detalhes de um equipamento específico.

### `PUT /api/equipamentos/[id]`
Atualiza os dados de um equipamento.

---

## Agendamentos

### `GET /api/agendamentos`
Lista agendamentos (filtra por usuário se for Professor).

### `POST /api/agendamentos`
Cria uma nova reserva.

---

## Retiradas

### `GET /api/retiradas`
Lista todas as movimentações de retirada e devolução.

### `POST /api/retiradas`
Registra o início de uma retirada.

### `PATCH /api/retiradas/[id]`
Registra a devolução de um equipamento.

---

## Dashboard e Relatórios

### `GET /api/dashboard`
Retorna estatísticas para os cards e gráficos da página inicial.

### `GET /api/relatorios`
Gera dados consolidados para exportação ou visualização gerencial.

---

## Usuários

### `GET /api/users`
Lista todos os usuários (Apenas ADMIN).

### `POST /api/users`
Cria um novo usuário.
