import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { AI_CONVERSATION, AI_SUGGESTIONS, AI_RESPONSES } from "@/lib/demo-data";

export const DemoAI = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState(AI_CONVERSATION);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now().toString(), role: "user" as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing and response
    setTimeout(() => {
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant" as const, 
        text: AI_RESPONSES[responseIndex % AI_RESPONSES.length] 
      };
      setMessages(prev => [...prev, aiMsg]);
      setResponseIndex(prev => prev + 1);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Cynda AI</h2>
            <p className="text-sm text-muted-foreground">Your workspace copilot</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : ""}`}>
              <SkeletonLoader className="w-2/3 h-24 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-card border border-border"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
            {AI_SUGGESTIONS.map((suggestion, i) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                onClick={() => handleSend(suggestion)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-all text-sm font-medium whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                {suggestion}
              </motion.button>
            ))}
          </div>

          {/* Input */}
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Cynda AI anything..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-14 pl-5 pr-14 rounded-2xl text-base"
            />
            <Button
              onClick={() => handleSend()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
