import { createApiRoute } from '@genkit-ai/next';
import { talkToAgentFlow } from '@/ai/flows/agent-flow';

export const POST = createApiRoute({ flow: talkToAgentFlow });
