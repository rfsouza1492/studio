
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Bot, User, Loader2, Send, TriangleAlert } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoals } from '@/context/GoalContext';
import { talkToAgent } from '@/ai/flows/agent-flow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isClient, setIsClient] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsApiKeyConfigured(!!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
    }
  }, []);

  const handleSendToAgent = async (text: string) => {
    if (!text.trim() || !isApiKeyConfigured) {
        setIsProcessing(false);
        return;
    }

    setIsProcessing(true);
    setMessages((prev) => [...prev, { sender: 'user', text: text }]);

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
      if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('400 Bad Request'))) {
        errorMessage = "A chave da API do Gemini não é válida ou não foi configurada corretamente. Verifique o arquivo .env.";
      }
      setMessages((prev) => [...prev, { sender: 'agent', text: errorMessage }]);
      setIsProcessing(false);
    }
  };
  
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Não suportado",
        description: "Seu navegador não suporta a API de reconhecimento de voz."
      });
      return;
    }
    
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
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
    return recognition;

  }, [toast]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isProcessing]);

  const handleToggleRecording = () => {
    if (!isSpeechRecognitionSupported) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      const recognition = setupSpeechRecognition();
      if(recognition) {
        setMessages([]); // Clear previous conversation on new voice input
        recognition.start();
        setIsRecording(true);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([]);
    handleSendToAgent(inputText);
    setInputText('');
  }

  const agentIsSpeaking = isProcessing && audioRef.current && !audioRef.current.paused;

  const renderContent = () => {
    if (!isClient) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-primary/10">
                <Skeleton className="h-16 w-16" />
            </div>
            <Skeleton className="mt-6 h-4 w-1/2" />
          </div>
      )
    }

    if (!isApiKeyConfigured) {
        return (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Configuração Necessária</AlertTitle>
                <AlertDescription>
                A chave da API do Gemini não foi configurada. Por favor, adicione sua chave ao arquivo <code className="font-mono bg-destructive-foreground/20 px-1 py-0.5 rounded text-destructive-foreground">.env</code> como <code className="font-mono bg-destructive-foreground/20 px-1 py-0.5 rounded text-destructive-foreground">NEXT_PUBLIC_GEMINI_API_KEY=SUA_CHAVE_AQUI</code> e reinicie o servidor.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <>
             {messages.length === 0 && !isRecording && !isProcessing ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                         <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-16 w-16 text-primary" />
                        </div>
                        <p className="mt-6 text-lg text-muted-foreground">
                            Pressione o microfone para começar ou digite abaixo.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-start gap-3", msg.sender === 'user' ? 'justify-end' : '')}>
                                    {msg.sender === 'agent' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                           <Bot className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-md rounded-xl px-4 py-3 text-sm",
                                        msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                           <User className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isProcessing && !agentIsSpeaking && (
                                <div className="flex items-start gap-3">
                                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="max-w-md rounded-xl bg-muted px-4 py-3 text-sm">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                             {isRecording && (
                                <div className="flex items-center justify-center p-4">
                                    <p className="text-muted-foreground animate-pulse">Ouvindo...</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
             )}
            <div className="mt-auto flex items-center gap-2 border-t p-4">
                <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2">
                    <Input 
                        placeholder="Ou digite sua pergunta..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isRecording || isProcessing}
                    />
                    <Button type="submit" size="icon" variant="ghost" disabled={!inputText || isProcessing || isRecording}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>

                {isSpeechRecognitionSupported && (
                     <Button 
                        size="icon" 
                        onClick={handleToggleRecording} 
                        disabled={isProcessing}
                        variant={isRecording ? 'destructive' : 'default'}
                    >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                )}
            </div>
        </>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
      <Header />
      <main className="mt-8">
        <Card className="flex h-[70vh] flex-col">
           <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Bot className='h-6 w-6 text-primary' />
                    <span>Agente IA</span>
                </CardTitle>
                <CardDescription>Converse com o Flow, seu assistente de produtividade.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-0">
               {renderContent()}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

    