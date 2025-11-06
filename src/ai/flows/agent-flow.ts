
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { ai } from '@/ai/genkit';
import { AgentInputSchema, AgentOutputSchema } from '@/app/types';
import type { AgentInput, AgentOutput } from '@/app/types';


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
    
    const fullPrompt = `${systemPrompt}\n\nUser message: ${query}`;

    // Call the structured prompt
    const { text } = await ai.generate({
      prompt: fullPrompt,
      output: { 
        format: 'json',
        schema: AgentOutputSchema
      },
    });

    try {
        const parsedOutput = JSON.parse(text);
        // Validate the parsed output against the schema
        const validation = AgentOutputSchema.safeParse(parsedOutput);
        if (validation.success) {
            return validation.data;
        } else {
             console.error("Agent output validation error:", validation.error);
             return {
                message: "Sorry, I received an invalid response from the AI. Let's try again.",
                action: 'answer'
            }
        }
    } catch (error) {
        console.error("Error parsing agent output:", error);
        return {
            message: 'Sorry, I had trouble understanding the response. Could you rephrase?',
            action: 'answer'
        }
    }
  }
);
