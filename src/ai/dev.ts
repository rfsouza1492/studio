import { start } from '@genkit-ai/tools/registry';
import { dev } from 'genkit/dev';
import config from '../../genkit.config';

dev(config, {
  // For simplicity, we are enabling CORS for all origins.
  // In a production environment, you should restrict this to your app's domain.
  cors: { origin: '*' },
});
