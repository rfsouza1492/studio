
'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação do GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 * - AgentInput - O tipo de entrada para a função talkToAgent.
 * - AgentOutput - O tipo de retorno para a função talkToAgent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Goal, Task } from '@/app/types';
import wav from 'wav';

// Definindo esquemas Zod para validação
const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  kpiName: z.string().optional(),
  kpiTarget: z.number().optional(),
  kpiCurrent: z.number().optional(),
});

const TaskSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  priority: z.enum(["Low", "Medium", "High"]),
  deadline: z.string().optional(),
  recurrence: z.enum(["None", "Daily", "Weekly", "Monthly"]),
  duration: z.number().optional(),
});

export const AgentInputSchema = z.object({
  query: z.string().describe('A pergunta ou comando do usuário.'),
  context: z.object({
    goals: z.array(GoalSchema),
    tasks: z.array(TaskSchema),
  }).describe('O estado atual das metas e tarefas do usuário.'),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

export const AgentOutputSchema = z.object({
  textResponse: z.string().describe('A resposta em texto para o usuário.'),
  audioResponse: z.string().optional().describe('A resposta em áudio (data URI base64) para o usuário.'),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;


// Função wrapper que será chamada pelo front-end
export async function talkToAgent(input: AgentInput): Promise<AgentOutput> {
  return agentFlow(input);
}


// Definição do prompt
const agentPrompt = ai.definePrompt({
    name: 'agentPrompt',
    input: { schema: AgentInputSchema },
    output: { schema: z.object({ textResponse: AgentOutputSchema.shape.textResponse }) },
    prompt: `
        Você é Flow, um assistente de produtividade amigável e inteligente para o aplicativo GoalFlow.
        Sua personalidade é concisa, prestativa e um pouco espirituosa.
        Sua principal função é ajudar os usuários com suas metas e tarefas, mas você também pode responder a perguntas de conhecimento geral.

        CONTEXTO DO USUÁRIO (se relevante para a pergunta):
        Metas:
        {{#each context.goals}}
        - {{name}} (ID: {{id}})
        {{else}}
        Nenhuma meta cadastrada.
        {{/each}}

        Tarefas:
        {{#each context.tasks}}
        - {{title}} (ID: {{id}}, Meta ID: {{goalId}}, Concluída: {{completed}}, Prazo: {{deadline}})
        {{else}}
        Nenhuma tarefa cadastrada.
        {{/each}}

        PERGUNTA DO USUÁRIO:
        "{{{query}}}"

        Responda à pergunta do usuário de forma clara e direta.
    `,
    config: {
        model: 'googleai/gemini-2.5-flash',
    }
});


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// Definição do fluxo
const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: AgentOutputSchema,
  },
  async (input) => {
    // 1. Gerar a resposta em texto
    const llmResponse = await agentPrompt(input);
    const textResponse = llmResponse.output?.textResponse ?? "Não consegui entender, pode repetir?";

    // 2. Gerar a resposta em áudio (TTS) em paralelo
    const ttsPromise = ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: textResponse,
    });

    const { media } = await ttsPromise;

    let audioResponse: string | undefined = undefined;
    if (media?.url) {
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      const wavBase64 = await toWav(audioBuffer);
      audioResponse = `data:audio/wav;base64,${wavBase64}`;
    }

    // 3. Retornar ambas as respostas
    return {
      textResponse,
      audioResponse,
    };
  }
);
