'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 */
import { z } from 'zod';
import { AgentInputSchema, AgentOutputSchema } from '@/lib/schemas';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { gemini15Flash } from '@/genkit.config';
import { generate } from '@genkit-ai/ai';

const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
You MUST respond with a valid JSON object that adheres to the AgentOutput schema and nothing else.
Your entire response must be a single JSON object.
Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

Here is the required JSON object structure:
{
  "message": "Your conversational response here."
}`;

export const talkToAgentFlow = defineFlow(
  {
    name: 'talkToAgentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: AgentOutputSchema,
  },
  async ({ query, context }) => {
    const prompt = `User message: "${query}"\n\nUSER'S CURRENT CONTEXT (Goals and Tasks):\n${JSON.stringify(
      context,
      null,
      2
    )}`;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 0.5,
      },
      system: systemPrompt,
      output: {
        format: 'json',
        schema: AgentOutputSchema,
      },
    });

    const agentOutput = llmResponse.output();
    if (!agentOutput) {
      throw new Error('A resposta da IA está vazia ou em um formato inválido.');
    }

    return agentOutput;
  }
);

export async function talkToAgent(input: z.infer<typeof AgentInputSchema>): Promise<z.infer<typeof AgentOutputSchema>> {
  try {
    return await runFlow(talkToAgentFlow, input);
  } catch (error) {
    console.error('Erro ao executar o fluxo talkToAgent:', error);
    return {
      message: `Desculpe, tive um problema para processar sua solicitação. O serviço de IA pode não estar configurado corretamente.`,
    };
  }
}
