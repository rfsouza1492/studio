
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AgentInputSchema, AgentOutputSchema } from '@/app/types';
import type { AgentInput, AgentOutput } from '@/app/types';

const PromptInputSchema = z.object({
  systemPrompt: z.string(),
  query: z.string(),
});

// Define a structured prompt using definePrompt for clarity and reusability
const agentPrompt = ai.definePrompt(
  {
    name: 'agentPrompt',
    input: { schema: PromptInputSchema },
    output: { schema: AgentOutputSchema },
    prompt: `{{{systemPrompt}}}

    User message: {{{query}}}`,
  },
);


// Helper function to format the complex context object into a simple string.
function getGoalCoachPrompt(context: AgentInput['context']): string {
  return `You are Flow, a specialist coach in goal setting and productivity.

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

RESPONSE FORMAT (JSON):
{
  "message": "Your conversational response",
  "suggestions": [
    {
      "goalName": "Name of the SMART goal",
      "kpiName": "Measurable metric (optional)",
      "tasks": [
        {
          "title": "Specific task",
          "priority": "High",
          "duration": 60,
          "recurrence": "Daily"
        }
      ]
    }
  ],
  "action": "create_goals"
}

- Use "create_goals" when you have concrete suggestions.
- Use "clarify" when you need more information.
- Use "answer" for general questions.

RULES:
- Be concise and practical.
- Tasks should have a duration between 15-180 minutes.
- Use "High" priority only for urgent AND important tasks.
- Suggest a maximum of 3 goals at a time.
- Each goal should have 3-7 initial tasks.`;
}

function getChatPrompt(context: AgentInput['context']): string {
  return `You are Flow, the user's productivity assistant.

CONTEXT:
${JSON.stringify(context, null, 2)}

Answer questions about goals, tasks, and productivity in a friendly manner.
Format the response as JSON: { "message": "your answer", "action": "answer" }`;
}

// Wrapper function that will be called by the front-end
export async function talkToAgent(input: AgentInput): Promise<AgentOutput> {
  // Directly call the flow, ensuring the input matches the schema.
  return agentFlow(input);
}

// Define the main AI flow
const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: AgentOutputSchema,
  },
  async ({ query, context, mode }) => {
    const systemPrompt = mode === 'goal_coach' 
      ? getGoalCoachPrompt(context)
      : getChatPrompt(context);
    
    // Call the structured prompt
    const { output } = await agentPrompt({
      systemPrompt,
      query,
    });
    
    if (!output) {
      return {
        message: 'Sorry, I could not process your request.',
        action: 'answer'
      }
    }

    return output;
  }
);
