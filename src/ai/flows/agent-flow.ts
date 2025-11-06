'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 */
import { GoogleGenerativeAI } from '@google/genai';
import type { AgentInput, AgentOutput } from '@/app/types';

// Pega a chave da API das variáveis de ambiente. Falha se não estiver definida.
if (!process.env.GEMINI_API_KEY) {
  // Este erro será lançado durante a inicialização do servidor se a chave não estiver definida.
  // Isso é importante para o ambiente de produção (deploy).
  throw new Error('A variável de ambiente GEMINI_API_KEY não está definida.');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function talkToAgent({ query, context }: AgentInput): Promise<AgentOutput> {
  // 1. Define as instruções estritas para o modelo de IA
  const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
You MUST respond with a valid JSON object that adheres to the AgentOutput schema and nothing else.
Your entire response must be a single JSON object.
Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

Here is the required JSON object structure:
{
  "message": "Your conversational response here."
}`;

  try {
    // 2. Configura o modelo com a instrução do sistema e força a saída JSON
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // 3. Constrói o prompt do usuário
    const prompt = `User message: "${query}"\n\nUSER'S CURRENT CONTEXT (Goals and Tasks):\n${JSON.stringify(context, null, 2)}`;
    
    // 4. Faz a chamada da API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const parsedJson: AgentOutput = JSON.parse(text);

    // 5. Validação básica (o 'responseMimeType' já garante o formato JSON)
    if (!parsedJson || typeof parsedJson.message !== 'string') {
      throw new Error('Estrutura JSON inválida da IA: a propriedade "message" está faltando ou não é uma string.');
    }

    return parsedJson;

  } catch (error) {
    console.error('Erro em talkToAgent:', error);
    // 6. Retorna um erro estruturado se algo der errado
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    // Retorna uma mensagem amigável para o usuário.
    return {
      message: `Desculpe, tive um problema para processar sua solicitação. O serviço de IA pode não estar configurado corretamente.`,
    };
  }
}
