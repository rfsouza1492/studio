import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Note: The API key is defined in the .env file (NEXT_PUBLIC_GEMINI_API_KEY).
// Next.js automatically loads this variable into process.env.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY})],
  model: 'googleai/gemini-2.5-flash',
});
