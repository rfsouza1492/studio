import { NextRequest, NextResponse } from 'next/server';
import { talkToAgent } from '@/ai/flows/agent-flow';
import { AgentInputSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agentInput = AgentInputSchema.parse(body);

    const agentResponse = await talkToAgent(agentInput);

    return NextResponse.json(agentResponse);
  } catch (e) {
    console.error('Erro na rota da API do agente:', e);
    const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json(
      {
        message: `Falha ao processar a solicitação: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
