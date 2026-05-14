"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Send,
  Loader2,
  Database,
  CheckCircle2,
  AlertCircle,
  Bot,
  Sparkles,
  ChevronDown,
  Brain,
  Download,
  Plus,
  Trash2,
  X,
  MessageSquare,
} from "lucide-react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ============================================================
// TOOL LABELS & UTILS (Shared with AIChatClient)
// ============================================================

const TOOL_LABELS: Record<string, string> = {
  fetchProjects: "Fetching projects",
  fetchLeads: "Fetching leads",
  fetchClients: "Fetching clients",
  fetchTasks: "Fetching tasks",
  fetchFinances: "Fetching financial data",
  createProject: "Creating project",
  createLead: "Creating lead",
  createTask: "Creating task",
  createClient: "Creating client",
  createExpense: "Creating expense",
  createIncome: "Creating income",
  deleteProject: "Deleting project",
  deleteLead: "Deleting lead",
  deleteTask: "Deleting task",
  deleteExpense: "Deleting expense",
  exportCSV: "Generating CSV export",
};

const MUTATION_TOOLS = new Set([
  "createProject",
  "createLead",
  "createTask",
  "createClient",
  "createExpense",
  "createIncome",
  "deleteProject",
  "deleteLead",
  "deleteTask",
  "deleteExpense",
]);

// ============================================================
// SUB-COMPONENTS
// ============================================================

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 items-center justify-center bg-[#F4F4F5] rounded-none">
        <Bot className="h-4 w-4 text-[#71717A]" />
      </div>
      <div className="flex items-center gap-1 bg-[#F4F4F5] px-3 py-2 rounded-none">
        <span className="h-1 w-1 animate-bounce bg-[#A1A1AA] [animation-delay:0ms]" />
        <span className="h-1 w-1 animate-bounce bg-[#A1A1AA] [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-bounce bg-[#A1A1AA] [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function StatusBadge({ state, toolName }: { state: string; toolName: string }) {
  const label = TOOL_LABELS[toolName] ?? toolName;
  const isMutation = MUTATION_TOOLS.has(toolName);

  if (state === "input-streaming" || state === "input-available") {
    const Icon = isMutation ? (toolName.startsWith("delete") ? Trash2 : Plus) : Database;
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-[#71717A]">
        <Icon className="h-2.5 w-2.5 animate-pulse" />
        <span>{label}...</span>
      </div>
    );
  }

  if (state === "output-available") {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-[#16A34A]">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>{label}</span>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-[#DC2626]">
        <AlertCircle className="h-2.5 w-2.5" />
        <span>Failed: {label}</span>
      </div>
    );
  }

  return null;
}

function ThinkingBlock({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-1 overflow-hidden border border-[#D4D4D8] bg-[#FAFAFA] rounded-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-2 py-1 text-left transition-colors hover:bg-[#F4F4F5] rounded-none"
      >
        <Brain
          className={`h-3 w-3 shrink-0 ${
            isStreaming ? "animate-pulse text-[#8B5CF6]" : "text-[#A1A1AA]"
          }`}
        />
        <span className="flex-1 text-[10px] font-medium text-[#71717A]">
          {isStreaming ? "Thinking..." : "View reasoning"}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-[#A1A1AA] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-[#D4D4D8] px-2 py-2">
          <p className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-[#71717A]">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

function CSVDownloadButton({ csv, filename }: { csv: string; filename: string }) {
  const handleDownload = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] text-[#16A34A]">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>Export ready</span>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 border border-[#D4D4D8] bg-white px-2 py-1 text-xs text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] rounded-none"
      >
        <Download className="h-3 w-3" />
        <span>{filename}</span>
      </button>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
        h1: ({ children }) => <h1 className="mb-1 mt-2 text-xs font-semibold text-[#0A0A0A]">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-1 mt-2 text-[11px] font-semibold text-[#0A0A0A]">{children}</h2>,
        ul: ({ children }) => <ul className="mb-1 ml-3 list-disc space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-1 ml-3 list-decimal space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="text-[11px] leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-[#0A0A0A]">{children}</strong>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block overflow-x-auto bg-[#0A0A0A] p-2 font-mono text-[10px] text-[#FAFAFA]">
              {children}
            </code>
          ) : (
            <code className="bg-[#E4E4E7] px-1 py-0.5 font-mono text-[10px] text-[#3F3F46]">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="mb-1 overflow-x-auto border border-[#D4D4D8]">
            <table className="w-full text-[10px]">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-[#D4D4D8] bg-[#F4F4F5] px-2 py-1 text-left font-semibold text-[#3F3F46]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-[#F4F4F5] px-2 py-1 text-[#3F3F46]">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FloatingAIChat({ spaceId }: { spaceId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { spaceId } }),
    [spaceId]
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !spaceId) return;
    sendMessage({ text: input });
    setInput("");
  };

  if (!spaceId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Bubble */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] flex-col border border-[#0A0A0A] bg-white shadow-none md:w-[400px] rounded-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#0A0A0A] bg-[#0A0A0A] px-4 py-3 text-[#FAFAFA] rounded-none">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Auxilium AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#FAFAFA] transition-opacity hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Sparkles className="mb-2 h-5 w-5 text-[#71717A]" />
                  <p className="text-[11px] text-[#71717A]">
                    Ask anything about your workspace.
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#F4F4F5] rounded-none">
                      <Bot className="h-3 w-3 text-[#71717A]" />
                    </div>
                  )}

                  <div
                    className={`flex max-w-[85%] flex-col gap-1 ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {m.parts.map((part, index) => {
                      if (part.type === "text" && m.role === "user") {
                        return (
                          <div
                            key={index}
                            className="bg-[#0A0A0A] px-3 py-2 text-xs text-white rounded-none"
                          >
                            <span className="whitespace-pre-wrap">{part.text}</span>
                          </div>
                        );
                      }

                      if (part.type === "text" && part.text.trim()) {
                        return (
                          <div
                            key={index}
                            className="bg-[#F4F4F5] px-3 py-2 text-xs text-[#0A0A0A] rounded-none"
                          >
                            <MarkdownContent content={part.text} />
                          </div>
                        );
                      }

                      if (part.type === "reasoning") {
                        const isStreaming = status === "streaming" && index === m.parts.length - 1;
                        return (
                          <div key={index} className="w-full">
                            <ThinkingBlock text={part.text} isStreaming={isStreaming} />
                          </div>
                        );
                      }

                      if (part.type.startsWith("tool-")) {
                        const toolPart = part as any;
                        const toolName = part.type.replace("tool-", "");

                        if (
                          toolName === "exportCSV" &&
                          toolPart.state === "output-available" &&
                          toolPart.output?.csv
                        ) {
                          return (
                            <div key={index}>
                              <CSVDownloadButton
                                csv={toolPart.output.csv}
                                filename={toolPart.output.filename ?? "export.csv"}
                              />
                            </div>
                          );
                        }

                        return (
                          <div key={index}>
                            <StatusBadge state={toolPart.state} toolName={toolName} />
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              ))}
              {status === "submitted" && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#D4D4D8] px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                className="flex-1 bg-[#FAFAFA] border border-[#D4D4D8] px-3 py-2 text-xs text-[#0A0A0A] placeholder:text-[#A1A1AA] focus:border-[#0A0A0A] focus:outline-none disabled:opacity-50 rounded-none"
                value={input}
                placeholder="Ask AI..."
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0A0A0A] text-white transition-all hover:bg-[#1A1A1A] disabled:opacity-30 rounded-none"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center bg-[#0A0A0A] text-[#FAFAFA] shadow-none transition-transform hover:scale-105 active:scale-95 rounded-none"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
      </button>
    </div>
  );
}
