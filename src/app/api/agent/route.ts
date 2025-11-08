import { talkToAgentFlow } from '@/ai/flows/agent-flow';
import { NextRequest, NextResponse } from 'next/server';
import { streamFlow } from '@genkit-ai/next/server';

export async function POST(req: NextRequest) {
  const { query, context } = await req.json();

  return streamFlow(
    talkToAgentFlow,
    {
      query,
      context,
    },
  );
}
