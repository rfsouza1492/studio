'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent using the Gemini REST API.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import type { AgentInput, AgentOutput } from '@/app/types';
import { AgentOutputSchema } from '@/app/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  // 1. Check for API Key
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured in .env.local');
    return {
      message: "The AI service is not configured. The Gemini API key is missing.",
    };
  }

  // 2. Define the strict instructions for the AI model
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
    You are having a conversation with a user about their goals and tasks.
    You MUST respond with a valid JSON object that adheres to the AgentOutput schema and nothing else.
    Your entire response must be a single JSON object.
    Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

    The JSON object must always include a "message" (string) property.

    Here is the required JSON object structure:
    {
      "message": "Your conversational response here."
    }`;

  // 3. Construct the request body for the REST API
  const requestBody = {
    "contents": [
      // Correctly place system prompt first in contents array for v1 API
      {
        "role": "system",
        "parts": [{ "text": systemPrompt }]
      },
      // Then the user content
      {
        "role": "user",
        "parts": [
          { "text": `User's question: "${query}"` },
          { "text": `USER'S CURRENT CONTEXT (Goals and Tasks):\n ${JSON.stringify(context, null, 2)}` }
        ]
      }
    ],
    "generationConfig": {
      // Use the correct property name for JSON output
      "response_mime_type": "application/json",
    }
  };

  // 4. Make the API call using fetch
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error from Gemini API:', response.status, JSON.stringify(errorBody, null, 2));
      throw new Error(`Gemini API request failed: ${JSON.stringify(errorBody)}`);
    }

    const responseData = await response.json();
    
    // 5. Extract and parse the JSON response from the AI
    const text = responseData.candidates[0].content.parts[0].text;
    
    const validationResult = AgentOutputSchema.safeParse(JSON.parse(text));

    if (!validationResult.success) {
        console.error("Invalid JSON structure from AI:", validationResult.error);
        throw new Error('Invalid JSON structure from AI.');
    }
    
    return validationResult.data;

  } catch (error) {
    console.error('Error in talkToAgent:', error);
    // 6. Return a structured error if anything goes wrong
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Sorry, I ran into a problem. ${errorMessage}`,
    };
  }
}
