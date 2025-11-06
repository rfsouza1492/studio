
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */

import { ai } from '@/ai/genkit';
import { AgentInput, AgentOutput, AgentInputSchema, AgentOutputSchema } from '@/app/types';

// Helper function to format the complex context object into a simple string.
function formatContext(context: AgentInput['context']): string {
    let contextString = 'USER CONTEXT (if relevant to the question):\n';

    contextString += 'Goals:\n';
    if (context.goals && context.goals.length > 0) {
        context.goals.forEach(goal => {
            contextString += `- ${goal.name} (ID: ${goal.id})\n`;
        });
    } else {
        contextString += 'No goals have been added yet.\n';
    }

    contextString += '\nTasks:\n';
    if (context.tasks && context.tasks.length > 0) {
        context.tasks.forEach(task => {
            contextString += `- ${task.title} (ID: ${task.id}, Goal ID: ${task.goalId}, Completed: ${task.completed}, Deadline: ${task.deadline})\n`;
        });
    } else {
        contextString += 'No tasks have been added yet.\n';
    }

    return contextString;
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
  async (input) => {
    
    // 1. Format the context from the input object into a string
    const formattedContext = formatContext(input.context);

    // 2. Construct the full prompt for the AI model
    const finalPrompt = `
        You are Flow, a friendly and intelligent productivity assistant for the GoalFlow app.
        Your personality is concise, helpful, and a bit witty.
        Your main function is to help users with their goals and tasks, but you can also answer general knowledge questions.

        ${formattedContext}

        USER'S QUESTION:
        "${input.query}"

        Answer the user's question clearly and directly.
    `;

    // 3. Generate the text response using the AI model
    const llmResponse = await ai.generate({
      prompt: finalPrompt,
      model: 'googleai/gemini-1.5-flash',
    });
    
    const textResponse = llmResponse.text();

    // The incorrect audio generation code has been removed.
    // The application will gracefully handle the absence of an audio response.

    return {
      textResponse: textResponse ?? "I didn't quite catch that, could you say it again?",
      audioResponse: undefined, // No audio is returned
    };
  }
);
