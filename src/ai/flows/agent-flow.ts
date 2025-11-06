'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { ai } from '@/ai/genkit';
import { AgentInputSchema, AgentOutputSchema } from '@/app/types';
import type { AgentInput, AgentOutput } from '@/app/types';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant.
You are having a conversation with a user.
You MUST respond with a valid JSON object that conforms to the following Zod schema:
${JSON.stringify(AgentOutputSchema.shape)}

The JSON object must always include a "message" (string) property.
Do not include any markdown formatting or other characters outside of the JSON object.

USER'S CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}
`;

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      prompt: `User message: "${query}"`,
    });

    let responseText = response.text;
    // Clean the response from markdown code blocks
    responseText = responseText.replace(/^```json\s*|```$/g, '').trim();

    const parsedJson = JSON.parse(responseText);
    const validationResult = AgentOutputSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error("Agent response validation error:", validationResult.error);
      throw new Error("Invalid JSON structure from AI.");
    }

    return validationResult.data;
  } catch (error) {
    console.error("Error in talkToAgent flow:", error);
    // Return a structured error response that the frontend can handle
    return {
      message:
        'Desculpe, tive um problema para processar sua solicitação. Vamos tentar de novo.',
    };
  }
}
