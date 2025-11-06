
import { googleGenai } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';
import { configure } from 'genkit';

export default configure({
  plugins: [
    firebase(),
    googleGenai({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
