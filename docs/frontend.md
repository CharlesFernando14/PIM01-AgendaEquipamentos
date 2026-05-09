# Frontend

## Estrutura e Organização
O frontend é construído sobre o **Next.js App Router**, localizado na pasta `src/app`.

### Organização de Páginas
Cada pasta dentro de `src/app` representa uma rota:
- `/dashboard`: Visão geral e estatísticas.
- `/equipamentos`: Listagem e gestão de itens.
- `/agendamento`: Interface de reservas.
- `/retiradas`: Controle de entrega/devolução.
- `/usuarios`: Gestão de usuários (apenas Admin).
- `/login`: Portal de acesso.

### Layout e Navegação
- **AppLayout (`src/components/AppLayout.tsx`):** Componente pai que envolve todas as páginas autenticadas, fornecendo a estrutura de cabeçalho e container.
- **AppSidebar (`src/components/AppSidebar.tsx`):** Menu lateral persistente que adapta os links exibidos com base no perfil do usuário.
- **NavLink (`src/components/NavLink.tsx`):** Componente para links de navegação com tratamento de estado ativo.

### Gerenciamento de Estado
- **Estados Locais:** Uso de `useState` para controle de formulários, modais e filtros.
- **Side Effects:** Uso de `useEffect` para buscas de dados iniciais em componentes Client-Side.
- **TanStack Query (React Query):** Utilizado para gerenciamento de cache de dados assíncronos e estados de loading/erro em partes críticas do sistema.

### Consumo de APIs
O sistema utiliza o `fetch` nativo do navegador para comunicação com o backend.
- **Padrão de Requisição:**
  ```typescript
  const response = await fetch('/api/equipamentos', {
    method: 'POST',
    body: JSON.stringify(dados),
    headers: { 'Content-Type': 'application/json' }
  });
  ```

### Estilização
- **Tailwind CSS:** Utilizado para todas as estilizações, seguindo um sistema de design baseado em variáveis de cor definidas no `globals.css`.
- **Shadcn UI:** Base de componentes acessíveis e customizáveis (Botões, Inputs, Dialogs, Tables).
