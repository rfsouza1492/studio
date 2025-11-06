import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Note: The API key is defined in the .env file (GEMINI_API_KEY).
// Make sure the environment variable is loaded before initializing Genkit
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables. Please check your .env.local file.');
}

export const ai = genkit({
  plugins: [googleAI({apiKey})],
  model: 'googleai/gemini-1.5-flash',
});
