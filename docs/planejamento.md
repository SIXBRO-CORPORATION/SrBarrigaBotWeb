# Planejamento — Frontend: WhatsApp, Dashboard, Alunos e Pagamentos

> Complementa `docs/planejamento.md` do backend (SrBarrigaBot). Este documento cobre
> a implementação, no `SrBarrigaBotWeb`, das telas que consomem os endpoints de
> WhatsApp, dashboard, alunos, pagamentos (com upload e preview de comprovante) e
> configuração, incluindo a reorganização das rotas existentes.

## 1. Levantamento do estado atual

Stack: Next.js 16 (App Router) + React 19 + TanStack Query v5 + Tailwind v4, sem
biblioteca de componentes (design system próprio, estética "tech/dark").

O que já existe e será reaproveitado:

- **`utils/http-client.ts`** — wrapper de `fetch` com refresh token automático em
  401, toast de erro automático e `ApiResponse<T>` (`success/data/message/error/code`).
  **Ponto de atenção**: hoje todo `post/patch/put` faz `JSON.stringify(body)` e força
  `Content-Type: application/json`. Isso não funciona para upload de arquivo — ver
  seção 4.
- **`services/*.service.ts`** — um arquivo por domínio, funções simples que chamam
  `httpClient` e devolvem `response.data`. Padrão a seguir para `student.service.ts`,
  `payment.service.ts`, `dashboard.service.ts`, `config.service.ts`.
- **`hooks/useWhatsapp.ts`** — padrão de `useQuery`/`useMutation` com
  `queryClient.invalidateQueries` no `onSuccess`. Mesmo padrão para os novos hooks.
- **`components/ui/{Button,Input,Modal,Loading,Toast}.tsx`** — todos com API
  "compound component" (`Button.Root/Icon/Text`, `Modal.Root/Content/Header/...`).
  Não existem ainda: componente de tabela/lista, input de arquivo, nem um `Select`.
  Vamos precisar criar esses três.
- **`components/app/{Layout,Sidebar}.tsx`** — toda página autenticada é
  `<DashboardLayout><...></DashboardLayout>`. O `Sidebar` tem um array `menuItems`
  fixo e precisa passar a exibir **DASHBOARD**, **WHATSAPP**, **ALUNOS** e
  **CONFIGURAÇÕES**.
- **`middleware.ts`** — protege qualquer rota não listada em `publicRoutes`
  automaticamente via cookie do `access_token`. Nenhuma rota nova precisa de guard
  manual, só não pode ser adicionada a `publicRoutes`.
- **`app/(home)/page.tsx`** — é a tela antiga do WhatsApp. Ela deve ser movida para
  `app/whatsapp/page.tsx`; o grupo `(home)` não deve continuar representando a
  navegação principal.
- **`app/settings/page.tsx`** — hoje é um placeholder ("EM DESENVOLVIMENTO"). A
  tela de configuração de mensalidade/data de início (`GET/PATCH /config`) entra
  aqui, substituindo o placeholder.

## 2. Endpoints novos a consumir

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/students` | Lista de alunos (resumo) |
| `POST` | `/students` | Criar aluno |
| `GET` | `/students/:id` | Detalhe (status, saldo, timeline mês a mês, histórico de pagamentos) |
| `PATCH` | `/students/:id` | Editar aluno |
| `DELETE` | `/students/:id` | Remover aluno (soft delete) |
| `GET` | `/students/:id/timeline` | Timeline isolada (se o detalhe não for suficiente para alguma tela) |
| `POST` | `/students/:id/payments` | Registrar pagamento — **multipart/form-data**, campo de arquivo `comprovante` (opcional) |
| `GET` | `/students/:id/payments` | Histórico de pagamentos do aluno |
| `DELETE` | `/payments/:id` | Estornar pagamento |
| `GET` | `/dashboard/summary` | Cards do dashboard (valor esperado, arrecadado, inadimplência) |
| `GET` | `/config` | Config atual (mensalidade, dia de início, etc.) |
| `PATCH` | `/config` | Atualizar config |

Confirmar com o backend, antes de codar, o **shape exato** de cada resposta
(nomes de campo em `StudentResponse`, `PaymentResponse`, `StudentDetailResponse`,
`DashboardSummaryResponse`) — o levantamento acima foi feito lendo os
controllers/DTOs do backend, mas o ideal é gerar os `types/*.ts` olhando a resposta
real (ou o DTO) pra não haver divergência de nome de campo.

## 3. Mudança de infraestrutura: upload multipart no `http-client`

O `HttpClient.post` atual sempre faz:

```ts
body: body ? JSON.stringify(body) : undefined
```

e força `Content-Type: application/json`. Para o upload do comprovante, o body
precisa ser um `FormData` **sem** `Content-Type` manual (o browser define o
`boundary` sozinho). Proposta: adicionar um método dedicado, sem mexer no
contrato dos existentes:

```ts
async postForm<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
        ...config,
        method: 'POST',
        body: formData,
    });
}
```

E em `request()`, só setar o `Content-Type: application/json` default **quando o
body não for `FormData`**:

```ts
if (!requestHeaders.has('Content-Type') && !(restConfig.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
}
```

O retry automático de refresh token (`return this.request<T>(endpoint, config)`)
continua funcionando sem alteração — o `FormData` original é reenviado por
referência dentro do mesmo `config`.

## 4. Tipos (`types/`)

Novos arquivos, seguindo o estilo de `types/whatsapp.ts` (interfaces simples,
sem classes):

- `types/student.ts` — `Student`, `StudentSummary`, `StudentDetail`,
  `StudentMonthStatus`, `CreateStudentRequest`, `UpdateStudentRequest`.
- `types/payment.ts` — `Payment` (`id, amount, paidAt, note, receiptUrl,
  createdAt`), `RegisterPaymentInput` (usado só no service/hook, não é enviado
  como JSON — vira `FormData`).
- `types/dashboard.ts` — `DashboardSummary`.
- `types/config.ts` — `SystemConfig`, `UpdateConfigRequest`.

## 5. Services (`services/`)

### `student.service.ts`
```ts
export const studentService = {
    list: async (): Promise<StudentSummary[]> => (await httpClient.get<StudentSummary[]>('/students')).data ?? [],
    getDetail: async (id: string): Promise<StudentDetail> => (await httpClient.get<StudentDetail>(`/students/${id}`)).data!,
    create: async (data: CreateStudentRequest): Promise<Student> => (await httpClient.post<Student>('/students', data)).data!,
    update: async (id: string, data: UpdateStudentRequest): Promise<Student> => (await httpClient.patch<Student>(`/students/${id}`, data)).data!,
    remove: async (id: string): Promise<void> => { await httpClient.delete(`/students/${id}`); },
};
```

### `payment.service.ts` (o único que usa `postForm`)
```ts
export const paymentService = {
    listByStudent: async (studentId: string): Promise<Payment[]> =>
        (await httpClient.get<Payment[]>(`/students/${studentId}/payments`)).data ?? [],

    register: async (studentId: string, input: RegisterPaymentInput): Promise<Payment> => {
        const formData = new FormData();
        formData.append('amount', String(input.amount));
        formData.append('paidAt', input.paidAt);
        if (input.note) formData.append('note', input.note);
        if (input.comprovante) formData.append('comprovante', input.comprovante);

        const response = await httpClient.postForm<Payment>(`/students/${studentId}/payments`, formData);
        return response.data!;
    },

    remove: async (paymentId: string): Promise<void> => { await httpClient.delete(`/payments/${paymentId}`); },
};
```

### `dashboard.service.ts` e `config.service.ts`
Triviais, um `get`/`patch` cada, mesmo padrão de `whatsapp.service.ts`.

## 6. Hooks (`hooks/`)

Um arquivo por domínio (`useStudents.ts`, `usePayments.ts`, `useDashboard.ts`,
`useConfig.ts`), reaproveitando o padrão de `useWhatsapp.ts`:

```ts
export const STUDENTS_QUERY_KEY = 'students';

export const useStudents = () => useQuery({
    queryKey: [STUDENTS_QUERY_KEY],
    queryFn: studentService.list,
});

export const useStudentDetail = (id: string) => useQuery({
    queryKey: [STUDENTS_QUERY_KEY, id],
    queryFn: () => studentService.getDetail(id),
    enabled: !!id,
});

export const useCreateStudent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: studentService.create,
        onSuccess: () => qc.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] }),
    });
};
// useUpdateStudent / useRemoveStudent seguem o mesmo molde
```

```ts
export const useRegisterPayment = (studentId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: RegisterPaymentInput) => paymentService.register(studentId, input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, studentId] }); // detalhe (saldo, timeline)
            qc.invalidateQueries({ queryKey: ['payments', studentId] });
        },
    });
};

export const useRemovePayment = (studentId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: paymentService.remove,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, studentId] });
            qc.invalidateQueries({ queryKey: ['payments', studentId] });
        },
    });
};
```

**Atenção com cache de `receiptUrl`**: a URL do comprovante que a API devolve é uma
signed URL do R2 com expiração (1h por padrão, configurável no backend). Não
faz sentido dar `staleTime` longo pra query de pagamentos — ou o usuário abre um
link já expirado. Duas opções, decidir na hora de implementar:
1. `staleTime: 0` na query de pagamentos (sempre refetch ao entrar na tela/abrir modal de histórico) — mais simples.
2. Botão "abrir comprovante" dispara um refetch pontual (`refetch()`) antes de
   dar `window.open(receiptUrl)`, garantindo uma URL fresca mesmo se a tela
   estiver aberta há mais de 1h.
Recomendo a opção 1 para o MVP.

## 7. Componentes novos

Nenhum dos três abaixo existe hoje em `components/ui`, e vamos precisar dos
três — todos seguindo a API "compound component" (`Root/...`) já usada em
`Button`/`Modal`/`Input`, pra não destoar do resto do design system:

- **`components/ui/Table.tsx`** — `Table.Root/Header/Row/Cell`, estilo "tech"
  (bordas 2px, `tech-text` no header, hover com `hover-glow`). Usado na lista de
  alunos e no histórico de pagamentos.
- **`components/ui/FileInput.tsx`** — input de arquivo estilizado (dropzone
  simples ou botão + nome do arquivo selecionado), com validação client-side de
  tipo (`image/jpeg,image/png,image/webp,application/pdf`) e tamanho (10MB) —
  espelhando as constantes do backend (`ALLOWED_RECEIPT_MIME_TYPES`,
  `MAX_RECEIPT_FILE_SIZE_BYTES`), pra dar feedback antes de bater na API.
- **`components/ui/Select.tsx`** — só se `statusMesAMes`/filtros precisarem de
  um select (ex.: filtrar alunos por status). Avaliar se um filtro simples com
  `Button`s (chips) resolve antes de criar um componente novo.

Componentes de tela (ficam em `components/app` ou dentro da própria rota):

- **`StudentFormModal`** — `Modal` com `Input.Group` para criar/editar aluno.
- **`RegisterPaymentModal`** — `Modal` com valor, data, nota e `FileInput` do
  comprovante. Estado de `loading` no `Button` durante o upload (pode demorar
  mais que as outras mutations por causa do envio do arquivo).
- **`ReceiptPreview`** — preview do comprovante já enviado. Para imagens,
  renderizar a signed URL em um modal com `<img>` responsivo; para PDF, usar
  `<iframe>`/`<object>` dentro do mesmo modal, com ação alternativa para abrir
  em nova aba. O preview deve ser acessível a partir de cada linha do histórico
  e exibir estado de carregamento/erro. Antes de abrir um comprovante, refazer
  a query de pagamentos quando necessário para obter uma signed URL válida.
- **`ConfirmDialog`** (genérico) — extrair o padrão já usado no modal de
  desconectar WhatsApp (`app/whatsapp/page.tsx`, bloco "DESCONECTAR WHATSAPP") pra
  um componente reutilizável, já que vamos precisar do mesmo confirm em
  "remover aluno" e "estornar pagamento".
- **`MonthTimelineGrid`** — grid de quadrados/pills, um por mês, colorido por
  status (pago / devendo / atrasado), a partir de `statusMesAMes`.
- **`DashboardSummaryCards`** — os 3 cards do dashboard usam
  `useDashboardSummary()` e passam a ficar em `/dashboard`, não na tela do
  WhatsApp.

## 8. Rotas/páginas

```
app/
  dashboard/
    page.tsx               # cards de valor esperado, arrecadado e inadimplência
  whatsapp/
    page.tsx               # tela antiga do bot, movida de /home
  students/
    page.tsx              # lista de alunos + botão "novo aluno" (StudentFormModal)
    [id]/
      page.tsx             # detalhe: header com saldo/status, MonthTimelineGrid,
                            # histórico de pagamentos (Table) + botão "registrar
                            # pagamento" (RegisterPaymentModal) + estorno por linha
  settings/
    page.tsx               # substitui o placeholder por form de GET/PATCH /config
```

### Regras de navegação

- A rota `/home` deve ser removida; não criar uma página de compatibilidade para
  ela.
- A tela antiga do bot deve existir somente em `/whatsapp`.
- O dashboard deve existir em `/dashboard` e ser a página autenticada inicial
  (redirecionamento da raiz autenticada para `/dashboard`, se a raiz continuar
  sendo utilizada).
- `components/app/Sidebar.tsx` deve listar `DASHBOARD` → `/dashboard`,
  `WHATSAPP` → `/whatsapp`, `ALUNOS` → `/students` e
  `CONFIGURAÇÕES` → `/settings`.

### Listagem de pagamentos

Não criar uma página global `/payments` no MVP. O backend disponibiliza o
histórico por aluno (`GET /students/:id/payments`), e o fluxo operacional é
registrar, consultar, abrir o comprovante e estornar um pagamento a partir do
detalhe do aluno. Concentrar essa informação ali evita duplicar a tabela e
mantém o contexto do aluno, sendo a opção mais eficiente com os endpoints
atuais.

Uma listagem global só deve ser adicionada depois, caso surja necessidade real
de conciliação por período/aluno/status. Nesse caso, primeiro será necessário
um endpoint paginado como `GET /payments` com filtros; não implementar uma
listagem global fazendo várias requisições por aluno.

## 9. Sequenciamento sugerido

1. **Infra**: `http-client.postForm`, tipos, services, hooks — sem UI ainda.
   Dá pra validar a integração com Postman/curl enquanto isso é feito.
2. **CRUD de aluno**: `/students` (lista + criar + editar + remover). Fecha o
   ciclo mais simples primeiro (sem upload).
3. **Pagamentos + upload de comprovante**: `RegisterPaymentModal`,
   `FileInput`, histórico com `Table`, estorno via `ConfirmDialog`. É a parte
   mais arriscada tecnicamente (multipart, validação de arquivo, signed URL
   expirando) — fazer depois de já ter o CRUD de aluno rodando reduz risco.
4. **Timeline mês a mês** (`MonthTimelineGrid`) dentro do detalhe do aluno.
5. **Preview de comprovante** (`ReceiptPreview`) para imagens e PDFs, com
   renovação de signed URL quando necessário.
6. **Rotas e navegação**: mover a tela antiga para `/whatsapp`, criar
   `/dashboard`, remover `/home` e atualizar o `Sidebar`.
7. **Dashboard**: `DashboardSummaryCards` em `/dashboard`.
8. **Config**: substituir o placeholder de `/settings`.

## 10. Decisões de escopo

- **Preview de comprovante**: faz parte do MVP. Imagens terão preview inline em
  modal; PDFs serão exibidos em `iframe`/`object`, com fallback para nova aba.
- **Listagem de pagamentos**: não haverá uma tela separada no MVP. O histórico
  no detalhe do aluno é suficiente e evita chamadas agregadas inexistentes.
- **Captura direta pela câmera no celular**: dá pra adicionar
  `capture="environment"` no `<input type="file">` pra abrir a câmera direto no
  mobile, em vez de só a galeria. Perguntar se isso é desejável (ajuda muito
  quem for lançar pagamento pelo celular na hora que o aluno paga).
- **Formato de erro de validação de arquivo**: o backend já devolve `code:
  "VALIDATION_ERROR"` com mensagem em PT-BR pronta pra exibir — o toast de erro
  do `http-client` já cobre isso automaticamente. Validar client-side antes do
  envio é só uma otimização de UX (feedback mais rápido), não uma necessidade.
- **Nome da rota de alunos**: manter `/students` para ficar alinhado ao path da
  API. A decisão de não criar `/payments` é independente da rota de alunos.
