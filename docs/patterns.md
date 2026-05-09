# Padrões do Projeto

## Convenções de Código
- **Nomenclatura:** PascalCase para componentes React, camelCase para variáveis e funções.
- **TypeScript:** Evitar o uso de `any`. Definir interfaces para retornos de API e propriedades de componentes.

## Padrão de APIs
- Sempre retornar um objeto JSON.
- Erros devem ter a chave `error` com uma mensagem amigável para o usuário.
- Utilizar `NextResponse` para consistência.

## Consumo de Dados (Fetch)
- **Não utilizar Axios.** Preferir o `fetch` nativo para reduzir o tamanho do bundle e aproveitar as features do Next.js.
- Sempre envolver chamadas de API em blocos `try/catch`.
- Exibir Toasts de erro em caso de falha na requisição.

## Formulários e Estados
- **Formulários Controlados:** Utilizar `useState` para inputs simples e `react-hook-form` para formulários complexos.
- **Feedback Visual:** Desabilitar botões de envio enquanto uma requisição está em progresso (`loading`).

## Estilização e UI
- **Tailwind First:** Evitar arquivos CSS separados.
- **Design System:** Usar apenas as cores e espaçamentos definidos no tema do Tailwind (configurado no `tailwind.config.ts`).
- **Iconografia:** Utilizar exclusivamente a biblioteca `lucide-react`.

## Notificações (Toasts)
- Usar a biblioteca `sonner` para mensagens de sucesso ou erro.
  - Sucesso: `toast.success("Mensagem")`
  - Erro: `toast.error("Mensagem")`
