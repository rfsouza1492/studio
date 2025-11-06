
'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import type { AgentInput, AgentOutput } from '@/app/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use the 'v1beta' endpoint which is compatible with the 'gemini-1.5-flash' model identifier.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  // 1. Check for API Key
  if (!GEMINI_API_KEY) {
    const errorMessage = "A chave da API Gemini não está configurada.";
    console.error(errorMessage);
    return {
      message: "O serviço de IA não está configurado. A chave da API está faltando.",
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
  // Note: The system prompt is placed first in the contents array for the v1beta API.
  // The generationConfig has been removed as it was causing invalid payload errors.
  const requestBody = {
    "contents": [
      {
        "role": "system",
        "parts": [{ "text": systemPrompt }]
      },
      {
        "role": "user",
        "parts": [
          { "text": `User message: "${query}"` },
          { "text": `USER'S CURRENT CONTEXT (Goals and Tasks):\n${JSON.stringify(context, null, 2)}` }
        ]
      }
    ]
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
      const errorBody = await response.text(); // Use .text() to avoid JSON parsing errors on non-JSON responses
      console.error('Error from Gemini API:', response.status, errorBody);
      throw new Error(`Gemini API request failed: ${errorBody}`);
    }

    const responseData = await response.json();
    
    // 5. Extract and parse the JSON response from the AI
    if (!responseData.candidates || !responseData.candidates[0].content.parts[0].text) {
        throw new Error("Invalid response structure from Gemini API.");
    }

    // Clean potential markdown formatting before parsing
    const textResponse = responseData.candidates[0].content.parts[0].text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    
    // Attempt to parse the cleaned text as JSON
    const parsedJson: AgentOutput = JSON.parse(textResponse);
    
    // Basic validation
    if (!parsedJson || typeof parsedJson.message !== 'string') {
         throw new Error('Invalid JSON structure from AI: "message" property is missing or not a string.');
    }
    
    return parsedJson;

  } catch (error) {
    console.error('Error in talkToAgent:', error);
    // 6. Return a structured error if anything goes wrong
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Desculpe, tive um problema para processar sua solicitação. ${errorMessage}`,
    };
  }
}
