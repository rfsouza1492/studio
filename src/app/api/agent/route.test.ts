
import { POST } from './route';
import { talkToAgentFlow } from '@/ai/flows/agent-flow';
import { streamFlow } from '@genkit-ai/next/server';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/ai/flows/agent-flow', () => ({
  talkToAgentFlow: jest.fn(),
}));

jest.mock('@genkit-ai/next/server', () => ({
  streamFlow: jest.fn(),
}));

describe('POST /api/agent', () => {
  it('should call streamFlow with query and context', async () => {
    const req = new NextRequest('http://localhost/api/agent', {
      method: 'POST',
      body: JSON.stringify({ query: 'test query', context: 'test context' }),
    });

    await POST(req);

    expect(streamFlow).toHaveBeenCalledWith(talkToAgentFlow, {
      query: 'test query',
      context: 'test context',
    });
  });

  it('should handle missing query', async () => {
    const req = new NextRequest('http://localhost/api/agent', {
        method: 'POST',
        body: JSON.stringify({ context: 'test context' }),
    });

    await POST(req);

    expect(streamFlow).toHaveBeenCalledWith(talkToAgentFlow, {
        query: undefined,
        context: 'test context',
    });
  });

  it('should handle missing context', async () => {
    const req = new NextRequest('http://localhost/api/agent', {
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
    });

    await POST(req);

    expect(streamFlow).toHaveBeenCalledWith(talkToAgentFlow, {
        query: 'test query',
        context: undefined,
    });
  });

    it('should handle empty request body', async () => {
        const req = new NextRequest('http://localhost/api/agent', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        await POST(req);

        expect(streamFlow).toHaveBeenCalledWith(talkToAgentFlow, {
            query: undefined,
            context: undefined,
        });
    });
});
