import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, Plus, Check } from "lucide-react";
import type { CoachMessage, CoachAction } from "@/types/coach";

interface CoachChatProps {
  messages: CoachMessage[];
  onSendMessage: (message: string) => void;
  onAction?: (action: CoachAction) => void;
  isTyping?: boolean;
}

export default function CoachChat({ messages, onSendMessage, onAction, isTyping }: CoachChatProps) {
  const [input, setInput] = useState("");
  const [executedActions, setExecutedActions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleActionClick = (action: CoachAction, msgId: string) => {
    const actionKey = `${msgId}-${action.label}`;
    if (executedActions.includes(actionKey)) return;
    
    onAction?.(action);
    setExecutedActions(prev => [...prev, actionKey]);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-12 scroll-smooth no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'assistant' ? 'items-start' : 'items-start justify-end'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`space-y-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' ? "Coach" : "You"}
                </div>
                <div className={`text-lg leading-relaxed ${msg.role === 'user' ? 'text-foreground font-medium' : 'text-foreground/90 font-serif italic'}`}>
                  {msg.content}
                </div>

                {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {msg.actions.map((action, i) => {
                      const isExecuted = executedActions.includes(`${msg.id}-${action.label}`);
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          disabled={isExecuted}
                          className={`rounded-full border-primary/20 transition-all ${isExecuted ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-primary/5 hover:bg-primary/10'}`}
                          onClick={() => handleActionClick(action, msg.id)}
                        >
                          {isExecuted ? <Check className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                          {isExecuted ? 'Added to List' : action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 items-start"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex gap-1 items-center h-8">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-border/40 bg-background/80 backdrop-blur-md sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto w-full relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share a reflection or ask for guidance..."
            className="h-14 rounded-full pl-6 pr-14 text-lg bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim()}
            className="absolute right-1.5 top-1.5 w-11 h-11 rounded-full shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
