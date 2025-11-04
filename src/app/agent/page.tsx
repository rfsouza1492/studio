
'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Bot, User, Loader2, Wand2, Send } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoals } from '@/context/GoalContext';
import { talkToAgent } from '@/ai/flows/agent-flow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

export default function AgentPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { goals, tasks } = useGoals();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Dynamically import for client-side only
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendToAgent(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            toast({
                variant: 'destructive',
                title: 'Permissão de Microfone Negada',
                description: 'Por favor, habilite o acesso ao microfone nas configurações do seu navegador.',
            });
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, [toast]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendToAgent = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setMessages((prev) => [...prev, { sender: 'user', text }]);

    try {
      const response = await talkToAgent({
        query: text,
        context: {
          goals,
          tasks,
        },
      });

      setMessages((prev) => [...prev, { sender: 'agent', text: response.textResponse }]);

      if (response.audioResponse) {
        const audio = new Audio(response.audioResponse);
        audioRef.current = audio;
        audio.play().catch(console.error);
        audio.onended = () => setIsProcessing(false);
      } else {
        setIsProcessing(false);
      }

    } catch (error) {
      console.error('Error talking to agent:', error);
      let errorMessage = "Desculpe, não consegui processar sua solicitação.";
      if (error instanceof Error && error.message.includes('API key not valid')) {
        errorMessage = "A chave da API do Gemini não é válida. Verifique o arquivo .env.";
      }
      setMessages((prev) => [...prev, { sender: 'agent', text: errorMessage }]);
      setIsProcessing(false);
    }
  };

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
        toast({
            variant: "destructive",
            title: "Não suportado",
            description: "Seu navegador não suporta a API de reconhecimento de voz."
        });
        return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      if(messages.length > 0) setMessages([]); // Clear previous conversation on new voice input
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(messages.length > 0 && !isRecording && !isProcessing) setMessages([]);
    handleSendToAgent(inputText);
    setInputText('');
  }

  const agentIsSpeaking = isProcessing;

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
      <Header />
      <main className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span>Agente GoalFlow</span>
            </CardTitle>
            <CardDescription>
              Converse com o agente para obter informações sobre suas metas e tarefas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="relative flex h-40 w-40 items-center justify-center">
                <div className={cn(
                    "absolute h-full w-full rounded-full bg-primary/10 transition-transform duration-1000",
                    agentIsSpeaking ? 'scale-100' : 'scale-0'
                )}></div>
                <div className={cn(
                    "absolute h-full w-full rounded-full bg-primary/20 transition-transform delay-200 duration-1000",
                    agentIsSpeaking ? 'scale-100' : 'scale-0'
                )}></div>
                
                 {isSpeechRecognitionSupported && <Button
                    size="icon"
                    className="h-24 w-24 rounded-full shadow-lg"
                    onClick={handleToggleRecording}
                    disabled={isProcessing}
                    >
                    {isProcessing && !isRecording ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                    ) : isRecording ? (
                        <MicOff className="h-10 w-10" />
                    ) : (
                        <Mic className="h-10 w-10" />
                    )}
                </Button>}
            </div>
            
             <p className="text-center text-sm text-muted-foreground h-4">
                {isRecording ? 'Ouvindo...' : isProcessing ? 'Processando...' : isSpeechRecognitionSupported ? 'Clique no microfone para falar ou digite abaixo' : 'Digite sua pergunta abaixo'}
            </p>

            <ScrollArea className="h-64 w-full rounded-md border p-4" ref={scrollAreaRef}>
                 <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3',
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.sender === 'agent' && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="h-5 w-5" />
                        </span>
                      )}
                      <div
                        className={cn(
                          'max-w-xs rounded-lg px-4 py-2 text-sm',
                          msg.sender === 'user'
                            ? 'rounded-br-none bg-primary text-primary-foreground'
                            : 'rounded-bl-none bg-muted'
                        )}
                      >
                        {msg.text}
                      </div>
                       {msg.sender === 'user' && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <Wand2 className="h-10 w-10 mb-4" />
                    <h3 className="font-semibold">Nenhuma conversa iniciada.</h3>
                    <p className="text-sm">Pergunte algo como "Quais são minhas tarefas para hoje?" ou "Resuma meu progresso".</p>
                  </div>
                )}
              </div>
            </ScrollArea>
             <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2">
                <Input 
                    placeholder="Digite sua pergunta..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isProcessing || isRecording}
                />
                <Button type="submit" disabled={isProcessing || isRecording || !inputText.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
