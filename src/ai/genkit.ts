import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Note: The API key is defined in the .env file (GEMINI_API_KEY).
export const ai = genkit({
  plugins: [googleAI()],
});
