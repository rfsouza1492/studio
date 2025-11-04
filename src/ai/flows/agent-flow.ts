
'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação do GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AgentInput, AgentOutput, AgentInputSchema, AgentOutputSchema } from '@/app/types';
import wav from 'wav';

// Função wrapper que será chamada pelo front-end
export async function talkToAgent(input: AgentInput): Promise<AgentOutput> {
  return agentFlow(input);
}

const promptTemplate = `
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
    `;


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
    // Etapa 1: Gerar a resposta em texto
    const textResponseGeneration = await ai.generate({
      prompt: promptTemplate,
      input: input,
      model: 'googleai/gemini-2.5-flash',
    });
    const textResponse = textResponseGeneration.text ?? "Não consegui entender, pode repetir?";
    
    let audioResponse: string | undefined = undefined;

    try {
      // Etapa 2: Gerar a resposta em áudio (TTS) a partir do texto gerado
      const audioResponseGeneration = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview-tts',
          prompt: textResponse,
          config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Algenib' },
                  },
              },
          },
      });

      const audioPart = audioResponseGeneration.media;
      if (audioPart?.url) {
          const base64PcmData = audioPart.url.substring(audioPart.url.indexOf(',') + 1);
          const audioBuffer = Buffer.from(base64PcmData, 'base64');
          const wavBase64 = await toWav(audioBuffer);
          audioResponse = `data:audio/wav;base64,${wavBase64}`;
      }
    } catch (error) {
        console.error("Erro ao gerar ou converter áudio:", error);
        // Continua sem áudio se houver um erro
    }


    return {
      textResponse,
      audioResponse,
    };
  }
);
