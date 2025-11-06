import { NextRequest, NextResponse } from 'next/server';
import { talkToAgent } from '@/ai/flows/agent-flow';
import { AgentInput } from '@/app/types';

export async function POST(req: NextRequest) {
  try {
    const { query, context, mode }: AgentInput = await req.json();

    if (!query || !context) {
        return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const result = await talkToAgent({
      query,
      context,
      mode: mode || 'chat',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro no agente:', error);
    return NextResponse.json(
      { message: 'Erro ao processar mensagem', details: error.message },
      { status: 500 }
    );
  }
}
