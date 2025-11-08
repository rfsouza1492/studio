# Plano de Testes (QA) - GoalFlow

Este documento descreve o plano de testes para garantir a qualidade e o funcionamento correto da aplicação GoalFlow.

## 1. Escopo do Teste

O teste abrange todas as funcionalidades da aplicação, incluindo a interface do usuário, lógica de negócios, integração com APIs externas (Google Calendar) e persistência de dados (Firestore).

## 2. Tipos de Teste

-   **Testes Funcionais:** Validar se cada funcionalidade se comporta conforme o esperado.
-   **Testes de Integração:** Verificar a comunicação entre os componentes e serviços (ex: Frontend <-> Firestore, Frontend <-> Google API).
-   **Testes de Usabilidade:** Avaliar a facilidade de uso e a experiência do usuário.
-   **Testes de Responsividade:** Garantir que a aplicação funcione bem em diferentes tamanhos de tela (desktop, tablet, mobile).

---

## 3. Cenários de Teste

### 3.1. Autenticação de Usuário

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **AUTH-01** | Login com Google (Sucesso) | 1. Na página de login, clicar em "Entrar com Google". 2. Na janela popup, selecionar uma conta Google válida e autorizar. | O usuário é redirecionado para a página principal (`/`). O nome e avatar do usuário aparecem no cabeçalho. |
| **AUTH-02** | Login com Google (Falha/Cancelamento) | 1. Na página de login, clicar em "Entrar com Google". 2. Fechar a janela popup ou negar a autorização. | O usuário permanece na página de login. Nenhuma autenticação ocorre. |
| **AUTH-03** | Logout | 1. Com o usuário logado, clicar no avatar no cabeçalho. 2. Selecionar a opção "Sair". | O usuário é deslogado e redirecionado para a página de login. |
| **AUTH-04** | Acesso a Rota Protegida (Não Autenticado) | 1. Sem estar logado, tentar acessar diretamente uma URL como `/` ou `/dashboard`. | O usuário é redirecionado para a página `/login`. |
| **AUTH-05** | Persistência da Sessão | 1. Fazer login. 2. Fechar a aba do navegador e reabri-la na URL do app. 3. Recarregar a página. | O usuário deve permanecer logado. |

### 3.2. Gerenciamento de Metas (CRUD)

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **GOAL-01** | Criar nova meta (simples) | 1. Clicar em "Nova Meta". 2. Preencher apenas o nome da meta. 3. Clicar em "Criar Meta". | A nova meta aparece na lista de metas na página principal. |
| **GOAL-02** | Criar nova meta (com KPI) | 1. Clicar em "Nova Meta". 2. Preencher o nome, nome do KPI, valor atual e valor alvo. 3. Clicar em "Criar Meta". | A nova meta aparece na lista, mostrando o progresso do KPI. |
| **GOAL-03** | Validação de formulário (Criar meta) | 1. Tentar criar uma meta sem nome. 2. Tentar criar uma meta com KPI atual maior que o alvo. | Mensagens de erro apropriadas são exibidas. A meta não é criada. |
| **GOAL-04** | Editar meta | 1. Em um card de meta, clicar no menu "..." e selecionar "Editar". 2. Alterar o nome e/ou valores do KPI. 3. Salvar as alterações. | O card da meta é atualizado com as novas informações. |
| **GOAL-05** | Deletar meta | 1. Clicar no menu "..." de uma meta e selecionar "Deletar". 2. Confirmar a exclusão na caixa de diálogo. | A meta e todas as suas tarefas associadas são removidas da interface. |
| **GOAL-06** | Estado Vazio | 1. Acessar a aplicação com um usuário que não possui metas. | Uma mensagem de "Crie Sua Primeira Meta" e um botão para criar são exibidos. |

### 3.3. Gerenciamento de Tarefas (CRUD)

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **TASK-01** | Criar nova tarefa | 1. Em um card de meta, clicar em "Adicionar Tarefa". 2. Preencher título, prioridade, data, hora, etc. 3. Salvar a tarefa. | A nova tarefa aparece na lista de tarefas da meta correspondente. |
| **TASK-02** | Marcar/Desmarcar tarefa como concluída | 1. Clicar na caixa de seleção ao lado de uma tarefa. 2. Clicar novamente. | A tarefa alterna entre os estados concluído (riscado) e pendente. O progresso da meta é atualizado. |
| **TASK-03** | Editar tarefa | 1. No menu "..." de uma tarefa, selecionar "Editar". 2. Modificar os detalhes da tarefa (título, prioridade, prazo). 3. Salvar. | A tarefa é atualizada na lista com as novas informações. |
| **TASK-04** | Deletar tarefa | 1. No menu "..." de uma tarefa, selecionar "Deletar". 2. Confirmar a exclusão. | A tarefa é removida da lista. O progresso da meta é recalculado. |
| **TASK-05** | Ordenação de tarefas | 1. Criar várias tarefas com diferentes prioridades e prazos. | As tarefas devem ser ordenadas por: status (pendente primeiro), prazo (mais próximo primeiro) e prioridade (alta primeiro). |

### 3.4. Integração com Google Agenda

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **GAPI-01** | Conectar conta Google | 1. Na página Agenda, clicar em "Conectar com o Google". 2. Autorizar o acesso à agenda. | A página exibe os eventos da agenda do Google para o dia atual. |
| **GAPI-02** | Visualizar eventos | 1. Acessar a página Agenda com a conta conectada. | Os eventos do dia são listados corretamente, com nome e horário. |
| **GAPI-03** | Criar tarefa a partir de um evento | 1. Ao lado de um evento, clicar em "Criar Tarefa". | Uma nova tarefa é criada na meta "Tarefas da Agenda" com o título do evento e o prazo correspondente. |
| **GAPI-04** | Criar tarefas em massa | 1. Selecionar múltiplos eventos na página Agenda. 2. Clicar em "Criar Tarefas Selecionadas". | Múltiplas tarefas são criadas na meta "Tarefas da Agenda". |
| **GAPI-05** | Criar evento a partir de uma tarefa | 1. Em uma tarefa que tenha data e duração, clicar no ícone `<CalendarPlus />`. | Um novo evento é criado no Google Calendar com os detalhes da tarefa. |

### 3.5. Página de Foco (Pomodoro)

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **FOCO-01** | Iniciar e pausar timer | 1. Selecionar uma tarefa. 2. Clicar em "Iniciar". 3. Clicar em "Pausar". 4. Clicar em "Iniciar" novamente. | O timer inicia a contagem regressiva, pausa e continua de onde parou. |
| **FOCO-02** | Conclusão de um ciclo de foco | 1. Selecionar uma tarefa e iniciar o timer. 2. Deixar o timer de 25 minutos terminar. | Um som de alarme toca. A tarefa selecionada é marcada como concluída. O timer muda para o modo "Pausa" (5 minutos). |
| **FOCO-03** | Conclusão de um ciclo de pausa | 1. Iniciar um ciclo de pausa. 2. Deixar o timer de 5 minutos terminar. | Um som de alarme toca. O timer muda de volta para o modo "Foco". |
| **FOCO-04** | Resetar o timer | 1. Clicar no botão de reset (`<RefreshCw />`). | O timer volta ao seu tempo inicial (25 ou 5 min) e para a contagem. |

### 3.6. Dashboard

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **DASH-01** | Progresso das Metas | 1. Concluir algumas tarefas de diferentes metas. 2. Acessar a página Dashboard. | A barra de progresso de cada meta reflete corretamente a porcentagem de conclusão. |
| **DASH-02** | Progresso Geral (Gráfico de Pizza) | 1. Concluir 1 de 4 tarefas totais no sistema. 2. Acessar o Dashboard. | O gráfico de pizza deve mostrar 25% "Concluídas" e 75% "Pendentes". |
| **DASH-03** | Tarefas por Prioridade (Gráfico de Barras) | 1. Criar tarefas pendentes com prioridades variadas. 2. Acessar o Dashboard. | O gráfico de barras deve exibir a contagem correta de tarefas pendentes para cada nível de prioridade. |

### 3.7. Agente IA

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **AI-01** | Conversa por texto | 1. Na página Agente IA, digitar uma pergunta (ex: "Quais são minhas tarefas?"). 2. Pressionar Enter ou clicar em "Enviar". | O agente responde com uma mensagem de texto relevante, baseada no contexto das metas e tarefas. |
| **AI-02** | Contexto da conversa | 1. Perguntar "Quais minhas metas?". 2. Em seguida, perguntar "Resuma a primeira delas". | O agente deve entender que "a primeira delas" se refere à primeira meta da resposta anterior. |

### 3.8. Responsividade

| ID do Teste | Cenário | Passos para Execução | Resultado Esperado |
| :---------- | :------ | :------------------- | :----------------- |
| **RESP-01** | Visualização em Mobile | 1. Abrir a aplicação em um navegador com a largura de um smartphone (ex: 375px). 2. Navegar por todas as páginas. | A interface se adapta corretamente. O menu de navegação é colapsado em um menu "hambúrguer". Não há overflow horizontal. |
| **RESP-02** | Visualização em Tablet | 1. Abrir a aplicação em um navegador com a largura de um tablet (ex: 768px). 2. Navegar por todas as páginas. | A interface se adapta corretamente. Elementos como a lista de metas podem mudar de 1 para 2 colunas. |
