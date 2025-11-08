import { talkToAgentFlow } from '@/ai/flows/agent-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query, context } = await req.json();

  const result = await talkToAgentFlow.run({
    input: {
      query,
      context,
    },
  });

  return NextResponse.json(result);
}
