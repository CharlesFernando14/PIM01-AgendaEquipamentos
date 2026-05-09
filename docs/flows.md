# Fluxos Principais do Sistema

## 1. Fluxo de Autenticação
1.  O usuário acessa a página de login.
2.  Informa credenciais.
3.  Se for o primeiro login (`mustChangePassword: true`), é redirecionado para `/change-password`.
4.  Após a troca ou se já tiver senha definida, segue para o seu `roleDefaultRoute`.

## 2. Fluxo de Agendamento
1.  **Consulta:** O Professor visualiza a lista de equipamentos.
2.  **Reserva:** Abre o modal de agendamento, escolhe data e horário.
3.  **Validação:** O sistema verifica se o equipamento já está reservado no período.
4.  **Confirmação:** O registro é criado com status `pendente` ou `confirmado` (conforme configuração).

## 3. Fluxo de Retirada (Check-out)
1.  O usuário comparece ao local.
2.  O **Técnico** ou **Admin** localiza o agendamento/equipamento na tela de `/retiradas`.
3.  Clica em "Registrar Retirada".
4.  O status do equipamento muda para `em_uso` e o status da Retirada para `RETIRADO`.

## 4. Fluxo de Devolução (Check-in)
1.  O usuário devolve o item.
2.  O **Técnico** localiza a retirada ativa.
3.  Registra a data de devolução e adiciona observações se houver danos.
4.  O status do equipamento volta para `disponivel`.

## 5. Fluxo de Feedback
1.  Após o uso, o usuário pode acessar o histórico.
2.  Clica em "Enviar Feedback".
3.  Preenche a nota e comentário.
4.  O **Admin** visualiza o feedback para tomar providências em caso de problemas técnicos relatados.
