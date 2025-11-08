
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent using the Gemini REST API.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { z } from 'zod';
import { AgentInputSchema, AgentOutputSchema } from '@/lib/schemas';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { geminiPro } from '../../genkit.config';
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
      model: geminiPro,
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
    console.error('Error in talkToAgent:', error);
    // 6. Return a structured error if anything goes wrong
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Sorry, I ran into a problem. ${errorMessage}`,
    };
  }
}
