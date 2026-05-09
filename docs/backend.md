# Backend

## API Routes
O backend é composto por **API Routes** localizadas em `src/app/api`. Elas funcionam como funções lambda que processam requisições HTTP.

## Padrão de Implementação
Cada rota (ex: `route.ts`) implementa métodos exportados como `GET`, `POST`, `PUT`, `PATCH` ou `DELETE`.

### Exemplo de Estrutura:
```typescript
export async function GET(request: Request) {
  try {
    const data = await prisma.modelo.findMany();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Mensagem de erro' }, { status: 500 });
  }
}
```

## Persistência com Prisma
O Prisma é utilizado como ORM. A instância do cliente é centralizada em `src/lib/prisma.ts` para evitar múltiplas conexões em desenvolvimento.

## Validações e Tratamento de Erros
- **Validação Manual:** Campos obrigatórios são verificados no início da função.
- **Status Codes:**
  - `200/201`: Sucesso.
  - `400`: Erro de validação de dados.
  - `401`: Usuário não autenticado.
  - `403`: Usuário sem permissão (Role inválida).
  - `404`: Recurso não encontrado.
  - `500`: Erro interno no servidor.

## Autenticação de Endpoints
A maioria dos endpoints inicia validando a sessão:
```typescript
const session = await getSessionUser();
if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
```

## Tratamento de Dados
As datas são tratadas usando o padrão ISO-8601 e a biblioteca `date-fns` no servidor quando necessário para cálculos de períodos de agendamento.
