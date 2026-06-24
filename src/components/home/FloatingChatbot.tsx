"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const quickPrompts = [
  "O que o Brasil mais importa?",
  "Quais os melhores mercados para exportar café?",
  "Como consultar uma NCM?",
  "Comparativo gratuito vs premium",
];

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "Oi! Sou o assistente TRADEXA. Posso ajudar com dúvidas sobre comércio exterior, NCM, mercados de exportação e nossa plataforma. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userText = text || input;
    if (!userText.trim()) return;
    setInput("");

    const newUserMessage: ChatMessage = { id: Date.now(), role: "user", text: userText };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    // Simple rule-based responses (AI integration can be added later)
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let response = "";

      if (lower.includes("importa") || lower.includes("importação")) {
        response = "O Brasil é um grande importador de insumos industriais, produtos químicos, eletrônicos e combustíveis. Nosso dashboard de Importações permite filtrar por NCM, país de origem, porto e período. Acesse a plataforma para ver dados atualizados!";
      } else if (lower.includes("exporta") || lower.includes("exportação") || lower.includes("café")) {
        response = "Os principais mercados para o café brasileiro são EUA, Alemanha, Itália, Japão e Bélgica. Use nosso módulo de Inteligência de Exportação para descobrir volumes, preços e oportunidades por país e produto.";
      } else if (lower.includes("ncm") || lower.includes("hs") || lower.includes("codigo") || lower.includes("tarifário")) {
        response = "Você pode consultar qualquer NCM brasileira usando nossa ferramenta de Consulta NCM/HS. Basta digitar o código ou uma descrição do produto e terá acesso às alíquotas, descrições e estatísticas de importação.";
      } else if (lower.includes("premium") || lower.includes("gratuito") || lower.includes("planos") || lower.includes("valor")) {
        response = "A TRADEXA tem plano Essencial gratuito com acesso a dashboards, rankings e ferramentas essenciais. O plano Growth (R$ 289/mês) inclui IA NCM ilimitada e Intel Data completo. O plano Business (R$ 3.200/mês) tem tudo ilimitado com exportação CSV/PDF. Veja nossa página de Planos!";
      } else if (lower.includes("brasil") && lower.includes("eua")) {
        response = "Temos dados cruzados Brasil ↔ EUA com volumes, valores e tendências de comércio bilateral. Acesse o módulo Análise de Mercado > Dados Cruzados para explorar.";
      } else {
        response = "Ótima pergunta! Para acessar dados detalhados e análises completas, recomendo criar uma conta gratuita na TRADEXA. Temos dashboards, mapas e alertas que podem ajudar exatamente com isso. Quer começar?";
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#D80E16] to-[#b80b12] text-white shadow-xl shadow-[#D80E16]/30 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            style={{ height: 520 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D80E16] to-[#b80b12] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Assistente TRADEXA</p>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === "assistant" ? "bg-[#D80E16]/10" : "bg-slate-100"}`}>
                    {m.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-[#D80E16]" />
                    ) : (
                      <User className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className={`max-w-[80%] text-sm rounded-2xl px-3 py-2 ${m.role === "assistant" ? "bg-slate-100 text-slate-700 rounded-tl-sm" : "bg-[#D80E16] text-white rounded-tr-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#D80E16]/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#D80E16]" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-[#D80E16]/10 hover:text-[#D80E16] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 border-t border-slate-100 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-[#D80E16] text-white flex items-center justify-center hover:bg-[#E50716] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
