'use client';

import { useState, useRef, useEffect } from 'react';
import { useGoals } from '@/context/GoalContext';
import { Button } from '@/components/ui/button';
import { Mic, Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { AgentOutput } from '@/app/types';

type Message = {
    role: 'user' | 'assistant';
    content: string;
}

export default function AgentPage() {
  const { goals, tasks } = useGoals();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentInput,
          context: { goals, tasks },
        }),
      });

      if (!response.ok) {
          throw new Error("A resposta da API não foi bem-sucedida.");
      }

      const data: AgentOutput = await response.json();
      
      if (!data || !data.message) {
        throw new Error("Resposta da API inválida.");
      }

      const agentMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
          variant: 'destructive',
          title: 'Erro de comunicação',
          description: error instanceof Error ? error.message : 'Não foi possível obter uma resposta do agente.'
      })
      // Remove user message if agent fails to allow retry
      setMessages(prev => prev.filter(m => m !== userMessage));

    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 md:p-8">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                 <h1 className="text-3xl font-bold flex items-center gap-2"><Bot className='h-8 w-8 text-primary' /> Agente Flow</h1>
                 <p className="text-muted-foreground mt-1">Converse com Flow, seu assistente de produtividade.</p>
            </div>
        </div>
      </header>
      
      <main>
        <Card className="flex h-[calc(100vh-280px)] sm:h-[70vh] flex-col">
            <CardContent className="flex flex-1 flex-col p-0">
                 <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                         {messages.length === 0 && !isLoading && (
                            <div className="flex h-full flex-col items-center justify-center p-4 sm:p-8 text-center min-h-[200px]">
                                <div className="relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">
                                     Converse com Flow
                                </h2>
                                <p className="mt-2 text-base sm:text-lg text-muted-foreground">
                                    Funcionalidade desabilitada no momento.
                                </p>
                            </div>
                         )}

                        {messages.map((msg, idx) => (
                            <div key={idx}>
                                <div className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : '')}>
                                    {msg.role === 'assistant' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-md rounded-xl px-4 py-3 text-sm whitespace-pre-wrap",
                                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}>
                                        <p>{msg.content}</p>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                                            <User className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="max-w-md rounded-xl bg-muted px-4 py-3 text-sm">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex items-center gap-2 border-t p-4">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        onClick={() => {/* Implement Web Speech API */}}
                    >
                        <Mic className={isListening ? 'text-red-500' : ''} />
                    </Button>
                    
                    <form onSubmit={(e) => {e.preventDefault(); handleSendMessage();}} className="flex-1 flex items-center gap-2">
                         <Input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Faça uma pergunta..."
                            disabled
                        />
                        
                        <Button type="submit" size="icon" disabled>
                            <Send />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
