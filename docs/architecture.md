# Arquitetura do Sistema

## Visão Geral
O sistema segue uma arquitetura de **Monólito Modular** utilizando o framework Next.js. Tanto o frontend quanto o backend (API Routes) coexistem no mesmo repositório, compartilhando tipagens e lógica de negócio de forma eficiente.

## Padrão Utilizado
- **Frontend:** Server-Side Rendering (SSR) e Client-Side Rendering (CSR) conforme a necessidade de interatividade. O App Router gerencia as rotas de forma hierárquica.
- **Backend:** API Routes (arquitetura Serverless dentro do Next.js). Cada rota em `src/app/api` atua como um endpoint REST.
- **Persistência:** Prisma ORM atuando como ponte entre a lógica da aplicação e o banco de dados PostgreSQL.

## Fluxo de Dados
1.  **Requisição:** O usuário interage com a interface (frontend).
2.  **API Call:** O frontend dispara uma requisição `fetch` para um endpoint em `/api/...`.
3.  **Middleware:** A requisição passa pelo middleware de segurança para validação de sessão (JWT).
4.  **Controller (API Route):** O endpoint recebe a requisição, valida os dados e chama o Prisma.
5.  **Database:** O Prisma executa a query no PostgreSQL.
6.  **Resposta:** Os dados retornam pelo mesmo caminho até serem renderizados no frontend.

## Decisões Arquiteturais
- **Segurança via Middleware:** A proteção de rotas é centralizada no `middleware.ts`, garantindo que usuários não autorizados sequer acessem as páginas ou endpoints.
- **Componentes de UI Desacoplados:** Uso de Radix UI e Shadcn para garantir acessibilidade e rapidez no desenvolvimento visual.
- **Persistência de Sessão:** Uso de Cookies HttpOnly para armazenar o JWT, aumentando a segurança contra ataques XSS.
- **Tipagem Estrita:** Uso extensivo de TypeScript para garantir que os modelos do banco de dados sejam respeitados em todo o fluxo da aplicação.
