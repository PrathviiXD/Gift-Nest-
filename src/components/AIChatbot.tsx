import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Sparkles, Bot, User, CircleAlert as AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGrok } from "@/hooks/use-grok"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "bot"
  text: string
  suggestions?: string[]
  isGrokPowered?: boolean
}

const botReplies: Record<string, { text: string; suggestions?: string[] }> = {
  default: {
    text: "Hi! I'm your AI gift assistant powered by Grok. Tell me about the occasion, the person, or your budget and I'll help you find the perfect gift!",
    suggestions: ["Gift for mom's birthday", "Diwali gifts under ₹2000", "Wedding gift ideas", "Corporate gifts"],
  },
}

export function AIChatbot() {
  const { getRecommendations, loading } = useGrok()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      text: botReplies.default.text,
      suggestions: botReplies.default.suggestions,
    }
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setTyping(true)

    try {
      const grokResponse = await getRecommendations({ query: text })

      if (grokResponse) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: grokResponse,
          isGrokPowered: true,
          suggestions: ["Browse these", "View catalog", "Ask more"],
        }
        setMessages(prev => [...prev, botMsg])
      } else {
        const fallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "I'd love to help! Please describe the occasion, recipient, or budget in more detail and I'll provide personalized recommendations.",
          suggestions: ["Birthday gifts", "Diwali picks", "Corporate gifts"],
        }
        setMessages(prev => [...prev, fallbackMsg])
      }
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: "I encountered an error processing your request. Please try again or browse our catalog directly.",
        suggestions: ["View catalog", "Browse categories"],
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-card border rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <div>
                <p className="font-semibold text-sm">AI Gift Assistant</p>
                <p className="text-[10px] opacity-80">Powered by Grok + GiftNest</p>
              </div>
            </div>
            <Button variant="ghost" size="icon-xs" onClick={() => setOpen(false)} className="hover:bg-primary-foreground/10 text-primary-foreground">
              <X className="size-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-72 p-4">
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
                  <div className={cn(
                    "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "bot" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {msg.role === "bot" ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                  </div>
                  <div className={cn("max-w-[75%] space-y-2", msg.role === "user" && "items-end flex flex-col")}>
                    <div className={cn(
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      msg.role === "bot"
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}>
                      {msg.text}
                      {msg.isGrokPowered && (
                        <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
                          <Sparkles className="size-2.5" /> AI-powered by Grok
                        </div>
                      )}
                    </div>
                    {msg.suggestions && msg.role === "bot" && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="px-2.5 py-1 text-xs rounded-full border bg-background hover:bg-accent transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(typing || loading) && (
                <div className="flex gap-2">
                  <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              className="h-8 text-sm"
              disabled={loading}
            />
            <Button size="icon-sm" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
              <Send className="size-3.5" />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="border-t bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground flex items-start gap-1.5">
            <AlertCircle className="size-3 shrink-0 mt-0.5" />
            <span>Powered by Grok AI for intelligent gift recommendations</span>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        size="lg"
        className="rounded-full shadow-lg gap-2 h-12 px-4"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        {!open && <span className="text-sm font-medium">Ask AI</span>}
      </Button>
    </div>
  )
}
