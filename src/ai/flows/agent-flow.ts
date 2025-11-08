
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent using the Gemini REST API.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { z } from 'zod';
import { AgentInputSchema, AgentOutputSchema } from '@/lib/schemas';
import { ai } from '@genkit-ai/ai';
import { geminiPro } from '@genkit-ai/google-genai';

const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
Your response should be a conversational message to the user.`;

export const talkToAgentFlow = ai.defineFlow(
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

    const llmResponse = await ai.generate({
      model: geminiPro,
      prompt: prompt,
      config: {
        temperature: 0.5,
      },
      system: systemPrompt,
    });

    const message = llmResponse.text();
    if (!message) {
      throw new Error('A resposta da IA está vazia.');
    }
    
    return { message };
  }
);
