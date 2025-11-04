# GoalFlow: Seu Aliado de Produtividade

Bem-vindo ao GoalFlow! Este aplicativo foi desenvolvido para ajudá-lo a organizar suas metas, gerenciar tarefas diárias e manter o foco usando a técnica Pomodoro, tudo integrado à sua agenda do Google.

## Funcionalidades Principais

### 1. Gestão de Metas e Tarefas
- **Crie Metas:** Organize seu trabalho em metas maiores (ex: "Aprender Next.js", "Projeto Cliente X").
- **Adicione Tarefas:** Quebre suas metas em tarefas menores e gerenciáveis.
- **Defina Detalhes:** Atribua prioridade, data de entrega, recorrência e duração estimada para cada tarefa.
- **Acompanhe o Progresso:** Monitore o avanço de suas metas com base nas tarefas concluídas ou em um KPI (Indicador-Chave de Performance) que você pode definir.

### 2. Página "Checklist de Hoje"
- Uma visualização centralizada de todas as tarefas que você agendou para o dia atual.
- Permite que você veja rapidamente o que precisa ser feito e marque as tarefas como concluídas.

### 3. Página "Foco" (Técnica Pomodoro)
- **Timer de Foco:** Um timer regressivo de 25 minutos para trabalho focado e um de 5 minutos para pausas.
- **Associe Tarefas:** Selecione uma tarefa da sua lista para focar durante a sessão.
- **Conclusão Automática:** Ao final de um ciclo de 25 minutos, a tarefa selecionada é marcada como concluída.
- **Contador de Ciclos:** Acompanhe quantos "pomodoros" você completou.

### 4. Página "Agenda" (Integração com Google Calendar)
- **Visualize Eventos:** Conecte sua conta do Google para ver os eventos da sua agenda do dia.
- **Crie Tarefas a Partir de Eventos:** Crie tarefas no GoalFlow com um único clique a partir dos seus eventos do calendário.
- **Criação em Massa:** Selecione múltiplos eventos e crie tarefas para todos eles de uma só vez.

### 5. Tarefas para o Calendário
- **Crie Eventos a Partir de Tarefas:** Se uma tarefa no app tem data e duração, você pode clicar em um botão para adicioná-la como um evento no seu Google Calendar.

---

## Configurações Essenciais

Para que todas as funcionalidades operem corretamente, algumas configurações são necessárias.

### 1. Configuração da API do Google Calendar

Para que a integração com o Google Calendar funcione, você precisa autorizar o URL do seu aplicativo no Google Cloud Console.

1.  **Copie o URL do seu aplicativo:** Por exemplo, `https://6000-firebase-studio-1762225763401.cluster-ocv3ypmyqfbqysslgd7zlhmxek.cloudworkstations.dev`.
2.  **Acesse o Google Cloud Console:** Vá para a página de [Credenciais](https://console.cloud.google.com/apis/credentials) do seu projeto.
3.  **Edite o ID de Cliente OAuth 2.0:** Clique no nome do seu ID de cliente para abrir as configurações.
4.  **Adicione a "Origem JavaScript autorizada":**
    *   Na seção **"Origens JavaScript autorizadas"**, clique em **"+ ADICIONAR URI"**.
    *   Cole o URL do seu aplicativo no campo.
5.  **Salve** as alterações.

> **Nota:** Pode levar alguns minutos para que a alteração seja propagada.

### 2. Configuração do Webhook da Alexa

A página "Foco" pode enviar uma notificação para a Alexa quando um timer é iniciado. Para isso, você precisa criar um webhook em um serviço como o IFTTT (If This Then That) e conectá-lo a uma rotina da Alexa.

1.  **Crie o Webhook:** Use o IFTTT ou outro serviço para criar um webhook que possa acionar uma rotina na Alexa.
2.  **Obtenha o URL do Webhook:** O serviço fornecerá um URL único.
3.  **Atualize o Código:** Abra o arquivo `src/app/foco/page.tsx` e substitua o URL de exemplo pelo seu URL real na seguinte constante:
    ```javascript
    const ALEXA_WEBHOOK_URL = 'https://seu-webhook-aqui.com';
    ```

Com essas instruções, você está pronto para aproveitar ao máximo o GoalFlow!
