
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent using the Gemini REST API.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { z } from 'zod';
import { AgentInputSchema, AgentOutputSchema } from '@/lib/schemas';
import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';

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
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 0.5,
      },
      system: systemPrompt,
    });

    const message = llmResponse.text;
    if (!message) {
      throw new Error('A resposta da IA está vazia.');
    }
    
    return { message };
  }
);

export async function talkToAgent(input: z.infer<typeof AgentInputSchema>): Promise<z.infer<typeof AgentOutputSchema>> {
  try {
    return await talkToAgentFlow(input);
  } catch (error) {
    console.error('Error in talkToAgent:', error);
    // Return a structured error if anything goes wrong
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Sorry, I ran into a problem. ${errorMessage}`,
    };
  }
}
