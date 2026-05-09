# Autenticação

## Mecanismo de Sessão
A autenticação é baseada em **JWT (JSON Web Tokens)** armazenados em um cookie chamado `equipa-session`.

### Características do Cookie:
- `HttpOnly`: Sim (Inacessível via JavaScript no cliente).
- `Secure`: Sim (Apenas via HTTPS em produção).
- `SameSite`: Lax.
- `Expiração`: 8 horas.

## Fluxo de Login
1.  Usuário envia E-mail e Senha para `/api/auth/login`.
2.  O servidor valida as credenciais contra o banco de dados (Bcrypt).
3.  Um token JWT é gerado contendo `id`, `email`, `role` e `mustChangePassword`.
4.  O token é enviado no cabeçalho `Set-Cookie`.
5.  O servidor retorna o perfil do usuário e a rota inicial recomendada.

## Obtenção do Usuário Atual
A função utilitária `getSessionUser()` em `src/lib/auth.ts` é utilizada para recuperar os dados do usuário a partir do cookie em Server Components e API Routes.

## Proteção de Rotas (Middleware)
O arquivo `src/middleware.ts` intercepta todas as requisições e:
- Verifica se o token existe e é válido.
- Redireciona para `/login` caso não haja sessão.
- Força o redirecionamento para `/change-password` se `mustChangePassword` for verdadeiro.
- Verifica se o perfil do usuário tem acesso à rota solicitada.

## Logout
O endpoint `/api/auth/logout` limpa o cookie da sessão definindo sua validade como zero, forçando o navegador a descartá-lo.
