import { generate } from '@genkit-ai/ai';
import { geminiPro } from '@genkit-ai/google-genai';
import { onFlow } from 'firebase-functions/v2/https';
import * as z from 'zod';

export const helloFlow = onFlow(
  {
    name: 'helloFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Considere a seguinte string: '${subject}'. Responda de forma engraçada e com um tom de voz de um pirata. `,
      model: geminiPro,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);
