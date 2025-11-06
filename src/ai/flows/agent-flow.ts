'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { ai } from '@/ai/genkit';
import type { AgentInput, AgentOutput } from '@/app/types';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
You MUST respond with a valid JSON object.
Do not include any markdown formatting or other characters outside of the JSON object.

The JSON object must always include a "message" (string) property.

Here is the JSON object structure:
{
  "message": "Your conversational response here."
}`;

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      prompt: [
        `User message: "${query}"`,
        `USER'S CURRENT CONTEXT (Goals and Tasks):
         ${JSON.stringify(context, null, 2)}`
      ],
    });

    let responseText = response.text;
    
    // Clean the response from markdown code blocks
    responseText = responseText.replace(/^```json\s*|```$/g, '').trim();

    // The response from the AI should be a JSON string.
    const parsedResponse: AgentOutput = JSON.parse(responseText);

    // Ensure the message property exists.
    if (typeof parsedResponse.message !== 'string') {
        throw new Error('Invalid JSON structure from AI: "message" property is missing or not a string.');
    }

    return parsedResponse;
    
  } catch (error) {
    console.error("Error in talkToAgent flow:", error);
    // Return a structured error response that the frontend can handle
    return {
      message:
        'Desculpe, tive um problema para processar sua solicitação. Vamos tentar de novo.',
    };
  }
}
