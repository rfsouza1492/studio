'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { ai } from '@/ai/genkit';
import { AgentInputSchema, AgentOutputSchema } from '@/app/types';
import type { AgentInput, AgentOutput } from '@/app/types';

function getGoalCoachPrompt(context: AgentInput['context']): string {
  return `You are Flow, a specialist coach in goal setting and productivity. You MUST respond with a valid JSON object that conforms to the output schema. Do not include markdown or any other characters outside of the JSON object.

The JSON object must always include "message" (string), "action" (string, one of 'create_goals', 'clarify', 'answer'), and "suggestions" (an array of GoalSuggestion objects, which can be empty []).

USER CONTEXT:
- Current goals: ${context.goals.length}
- Pending tasks: ${context.tasks.filter((t: any) => !t.completed).length}

YOUR ROLE:
1. Ask strategic questions to understand the user's objectives.
2. Suggest SMART goals with measurable KPIs.
3. Break down goals into actionable tasks (with priority, estimated duration).
4. Provide constructive and motivating feedback.

CONVERSATION FLOW:
- If the user is starting: ask about areas of interest (career, health, education, etc.).
- If they already have a goal in mind: refine it using SMART and suggest tasks.
- If they ask for general help: offer practical examples.

RESPONSE ACTION:
- Use "create_goals" when you have concrete suggestions for goals and tasks.
- Use "clarify" when you need more information from the user.
- Use "answer" for general questions or conversation.

RULES:
- Be concise and practical.
- Tasks should have a duration between 15-180 minutes.
- Use "High" priority only for urgent AND important tasks.
- Suggest a maximum of 3 goals at a time.
- Each goal should have 3-7 initial tasks.`;
}

function getChatPrompt(context: AgentInput['context']): string {
  return `You are Flow, the user's friendly productivity assistant. You MUST respond with a valid JSON object that conforms to the output schema. Do not include markdown or any other characters outside of the JSON object.

The JSON object must always include "message" (string), "action" (string, set to 'answer'), and "suggestions" (an empty array []).

USER CONTEXT:
${JSON.stringify(context, null, 2)}

Answer questions about goals, tasks, and productivity in a friendly manner.`;
}

export async function talkToAgent(input: AgentInput): Promise<AgentOutput> {
  return agentFlow(input);
}

const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: AgentOutputSchema,
  },
  async ({ query, context, mode }) => {
    const systemPrompt =
      mode === 'goal_coach'
        ? getGoalCoachPrompt(context)
        : getChatPrompt(context);

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: systemPrompt,
        prompt: query,
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
        console.error("Error in agentFlow:", error);
        return {
            message: "Desculpe, tive um problema para processar sua solicitação. Vamos tentar de novo.",
            action: 'answer'
        };
    }
  }
);
