"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, X, Send, Loader2, Bot, User as UserIcon,
  Minimize2, Maximize2, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsage } from "@/hooks/use-usage";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  "Qual o código NCM para rolamentos?",
  "Compare exportação de café em 2024 vs 2025",
  "Explique o processo de licenciamento de importação",
  "Quais os principais parceiros da China?",
];

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente TRADEXA. Como posso ajudar com comércio exterior hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { consumePercent, plan, isAtLimit } = useUsage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    // Consume 9% of usage per question, with plan multiplier
    const multiplier = plan === "business" ? 0 : 0.4;
    const basePercent = 9;
    const adjustedPercent = Math.round(basePercent * multiplier);
    const ok = await consumePercent(adjustedPercent);
    if (!ok) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Você atingiu o limite de uso do plano. Faça upgrade para continuar usando o assistente IA.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("groq-chat", {
        body: { messages: chatHistory.slice(-8) },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data?.content || "Desculpe, não consegui processar esta solicitação.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Erro: ${err.message || "Serviço temporariamente indisponível"}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
  };

  // Hide chat for Essential plan
  if (plan === "essential") return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "auto" : undefined,
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white",
              isMinimized ? "w-[360px]" : "w-[380px] h-[560px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#D80E16] to-[#b80b12] px-4 py-3 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/15">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#D80E16]" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">Assistente TRADEXA</p>
                  <p className="text-[10px] font-medium text-white/60">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex gap-2.5",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg bg-[#D80E16]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-3.5 h-3.5 text-[#D80E16]" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[260px] px-3.5 py-2.5 rounded-2xl text-sm font-medium leading-relaxed",
                          msg.role === "user"
                            ? "bg-[#D80E16] text-white rounded-br-md"
                            : "bg-white text-slate-700 border border-slate-100 rounded-bl-md shadow-sm"
                        )}
                        dangerouslySetInnerHTML={{
                          __html: formatContent(msg.content),
                        }}
                      />
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#D80E16]/10 flex items-center justify-center shrink-0">
                        <Loader2 className="w-3.5 h-3.5 text-[#D80E16] animate-spin" />
                      </div>
                      <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick suggestions */}
                {messages.length < 3 && (
                  <div className="px-3 py-2 bg-white border-t border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Sugestões</p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-[#D80E16]/10 hover:text-[#D80E16] hover:border-[#D80E16]/20 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Pergunte sobre comércio exterior..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="rounded-xl h-10 border-2 border-slate-200 focus:border-[#D80E16]/40 bg-white text-sm font-medium pr-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!input.trim() || loading}
                      size="icon"
                      className={cn(
                        "rounded-xl h-10 w-10 transition-all shadow-lg",
                        input.trim() && !loading
                          ? "bg-[#D80E16] hover:bg-[#E50716] text-white"
                          : "bg-slate-200 text-slate-400"
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D80E16] to-[#b80b12] text-white shadow-xl shadow-[#D80E16]/30 flex items-center justify-center group relative"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-white">
              {unreadCount}
            </span>
          )}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
        </motion.button>
      )}
    </div>
  );
};

export default AIChat;
