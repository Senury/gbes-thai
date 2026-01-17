import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ExportImportChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const appendToMessage = (id: string, chunk: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + chunk } : msg
      )
    );
  };

  const streamResponse = async (text: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl) {
      throw new Error("Supabase URL is not configured");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/plain",
      ...(supabaseAnonKey ? { apikey: supabaseAnonKey } : {}),
    };
    const authToken = session?.access_token ?? supabaseAnonKey;
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/chat-export-import`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: text, language: "en" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to connect to chat service");
    }

    if (!response.body) {
      const text = await response.text();
      if (text) {
        appendToMessage(streamingMessageIdRef.current, text);
      }
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        appendToMessage(streamingMessageIdRef.current, chunk);
      }
    }
  };

  const streamingMessageIdRef = useRef<string>("");

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const timestamp = Date.now();

    const userMessage: Message = {
      id: `${timestamp}`,
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    const assistantId = `${timestamp}-ai`;
    streamingMessageIdRef.current = assistantId;
    const assistantMessage: Message = {
      id: assistantId,
      content: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await streamResponse(userMessage.content);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.filter(
          (msg) => !(msg.id === assistantId && msg.content.length === 0)
        )
      );
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        >
          <div className="flex flex-col items-center">
            <MessageCircle className="h-7 w-7" />
            <span className="text-xs font-bold mt-1">Chat</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 h-[500px] shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Export/Import Expert Chat
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Ask anything about Japan export/import operations
          </p>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[400px]">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Ask your export/import questions!<br />
                  e.g., "What are the procedures for exporting food to the US?"
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[280px] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className={`${message.isUser ? '' : 'prose prose-sm dark:prose-invert max-w-none'}`}
                    >
                      {message.content || (message.isUser ? '' : '')}
                    </ReactMarkdown>
                  </div>
                  {message.isUser && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportImportChat;
