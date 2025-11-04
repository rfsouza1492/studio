import { NextResponse } from 'next/server';

const ALEXA_WEBHOOK_URL = 'https://maker.ifttt.com/trigger/AGENDA/with/key/cipAdC-9yKzt9BXa8nRG0o';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskName, durationMinutes } = body;

    if (!taskName || durationMinutes === undefined) {
      return NextResponse.json({ error: 'Missing taskName or durationMinutes' }, { status: 400 });
    }

    if (!ALEXA_WEBHOOK_URL || ALEXA_WEBHOOK_URL.includes('example.com')) {
      console.warn('URL do webhook da Alexa não configurado no servidor. O webhook não será enviado.');
      return NextResponse.json({ message: 'Webhook URL not configured on server' }, { status: 200 });
    }

    const iftttResponse = await fetch(ALEXA_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value1: taskName,       // Nome da tarefa
        value2: durationMinutes, // Duração em minutos
      }),
    });

    if (!iftttResponse.ok) {
      const errorText = await iftttResponse.text();
      console.error('IFTTT webhook failed:', iftttResponse.status, errorText);
      return NextResponse.json({ error: 'Failed to trigger IFTTT webhook', details: errorText }, { status: iftttResponse.status });
    }
    
    console.log('Webhook para IFTTT enviado com sucesso.');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro no servidor proxy de webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
