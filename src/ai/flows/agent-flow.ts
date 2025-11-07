'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent using the Gemini REST API.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import type { AgentInput, AgentOutput } from '@/app/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  // 1. Check for API Key
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured');
    return {
      message: "The AI service is not configured. The Gemini API key is missing.",
    };
  }

  // 2. Define the strict instructions for the AI model
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
    You are having a conversation with a user about their goals and tasks.
    You MUST respond with a valid JSON object and nothing else.
    Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

    The JSON object must always include a "message" (string) property.

    Here is the required JSON object structure:
    {
      "message": "Your conversational response here."
    }`;

  // 3. Construct the request body for the REST API
  const requestBody = {
    "systemInstruction": {
      "parts": [{ "text": systemPrompt }]
    },
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": `User's question: "${query}"` },
          { "text": `USER'S CURRENT CONTEXT (Goals and Tasks):\n ${JSON.stringify(context, null, 2)}` }
        ]
      }
    ],
    "generationConfig": {
      "responseMimeType": "application/json",
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
    const parsedResponse: AgentOutput = JSON.parse(text);
    
    if (typeof parsedResponse.message !== 'string') {
        throw new Error('Invalid JSON structure from AI: "message" property is missing or not a string.');
    }
    
    return parsedResponse;

  } catch (error) {
    console.error('Error in talkToAgent:', error);
    // 6. Return a structured error if anything goes wrong
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Sorry, I ran into a problem. ${errorMessage}`,
    };
  }
}
