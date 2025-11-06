import { NextRequest, NextResponse } from 'next/server';
import { talkToAgent } from '@/ai/flows/agent-flow';
import { AgentInput } from '@/app/types';

export async function POST(req: NextRequest) {
  try {
    const { query, context }: AgentInput = await req.json();

    if (!query || !context) {
        return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const result = await talkToAgent({ query, context });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro no endpoint do agente:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao processar a mensagem.', details: error.message },
      { status: 500 }
    );
  }
}
