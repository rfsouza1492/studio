'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 */
import type { AgentInput, AgentOutput } from '@/app/types';
import { ai } from '@/ai/genkit';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  // 1. Define as instruções estritas para o modelo de IA
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
You MUST respond with a valid JSON object that adheres to the AgentOutput schema and nothing else.
Your entire response must be a single JSON object.
Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

The JSON object must always include a "message" (string) property.

Here is the required JSON object structure:
{
  "message": "Your conversational response here."
}`;

  try {
    // 2. Faz a chamada da API usando Genkit, especificando o modelo correto.
    const response = await ai.generate({
      model: 'googleai/gemini-pro',
      system: systemPrompt,
      prompt: [
        { text: `User message: "${query}"` },
        { text: `USER'S CURRENT CONTEXT (Goals and Tasks):\n${JSON.stringify(context, null, 2)}` }
      ]
    });

    if (!response.output) {
      throw new Error("A resposta da IA está vazia.");
    }
    
    // 3. Extrai e analisa a resposta JSON da IA
    // Limpa a formatação markdown potencial antes de analisar
    const textResponse = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedJson: AgentOutput = JSON.parse(textResponse);

    // Validação básica
    if (!parsedJson || typeof parsedJson.message !== 'string') {
      throw new Error('Estrutura JSON inválida da IA: a propriedade "message" está faltando ou não é uma string.');
    }

    return parsedJson;

  } catch (error) {
    console.error('Erro em talkToAgent:', error);
    // 4. Retorna um erro estruturado se algo der errado
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return {
      message: `Desculpe, tive um problema para processar sua solicitação. ${errorMessage}`,
    };
  }
}
