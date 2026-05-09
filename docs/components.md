# Componentes do Sistema

## Componentes de Layout

### `AppLayout`
O container principal da aplicação. Gerencia a exibição da Sidebar e do cabeçalho da página (Title, Subtitle e Actions).

### `AppSidebar`
Menu de navegação lateral. Utiliza o `usePathname` para destacar o item ativo e o perfil do usuário para filtrar os links.

### `NavLink`
Wrapper sobre o componente `Link` do Next.js que adiciona estilos de "active" quando a rota atual corresponde ao destino.

## Componentes de UI (Baseados em Radix/Shadcn)
Estão localizados em `src/components/ui`. Os mais utilizados são:
- **Button:** Diferentes variantes (default, destructive, outline, ghost).
- **Card:** Estrutura para blocos de conteúdo (Header, Title, Content).
- **Dialog:** Modais para formulários de criação e edição.
- **Table:** Listagens com cabeçalhos e linhas formatadas.
- **Badge:** Indicadores de status coloridos.
- **Input/Select/Checkbox:** Elementos de formulário controlados.
- **Toast/Toaster:** Notificações de feedback imediato ao usuário (via `sonner`).

## Componentes de Negócio

### `StatCard`
Utilizado no Dashboard para exibir métricas rápidas com ícones e variações de cor (Sucesso, Atenção, Info).

### Formulários
Os formulários são implementados usando `react-hook-form` com validação via `zod`, ou estados simples para filtros rápidos.
- Localização: Geralmente definidos dentro dos arquivos das páginas ou em pastas de componentes específicos quando reutilizados.
