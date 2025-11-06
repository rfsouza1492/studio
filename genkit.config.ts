import { gemini15Flash, vertexAI } from '@genkit-ai/googleai';
import { configureGenkit } from 'genkit';

export default configureGenkit({
  plugins: [
    vertexAI({
      location: 'us-central1',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { gemini15Flash };
