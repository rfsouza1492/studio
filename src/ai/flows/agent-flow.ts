'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { AgentInput, AgentOutput } from '@/app/types';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  // 1. Define as instruções estritas para o modelo de IA
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
You MUST respond with a valid JSON object that adheres to the AgentOutput schema and nothing else.
Your entire response must be a single JSON object.
Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

Here is the required JSON object structure:
{
  "message": "Your conversational response here."
}`;

  try {
    // 2. Faz a chamada da API usando Genkit
    const response = await ai.generate({
      model: googleAI.model('gemini-pro'),
      system: systemPrompt,
      prompt: `User message: "${query}"\n\nUSER'S CURRENT CONTEXT (Goals and Tasks):\n${JSON.stringify(context, null, 2)}`,
    });

    const text = response.text;
    
    // O Genkit pode retornar a string JSON com ```json ... ```, então limpamos isso.
    const cleanedText = text.replace(/^```json\n?/, '').replace(/```$/, '');

    const parsedJson: AgentOutput = JSON.parse(cleanedText);

    // 3. Validação básica
    if (!parsedJson || typeof parsedJson.message !== 'string') {
      throw new Error('Estrutura JSON inválida da IA: a propriedade "message" está faltando ou não é uma string.');
    }

    return parsedJson;

  } catch (error) {
    console.error('Erro em talkToAgent:', error);
    // 4. Retorna um erro estruturado se algo der errado
    // Retorna uma mensagem amigável para o usuário.
    return {
      message: `Desculpe, tive um problema para processar sua solicitação. O serviço de IA pode não estar configurado corretamente.`,
    };
  }
}
