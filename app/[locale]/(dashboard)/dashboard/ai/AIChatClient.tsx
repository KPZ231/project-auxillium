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
} from "lucide-react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ============================================================
// TOOL LABELS
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
// TYPING INDICATOR
// ============================================================

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F5]">
        <Bot className="h-4 w-4 text-[#71717A]" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#F4F4F5] px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A1A1AA] [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A1A1AA] [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A1A1AA] [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ state, toolName }: { state: string; toolName: string }) {
  const label = TOOL_LABELS[toolName] ?? toolName;
  const isMutation = MUTATION_TOOLS.has(toolName);

  if (state === "input-streaming" || state === "input-available") {
    const Icon = isMutation
      ? toolName.startsWith("delete")
        ? Trash2
        : Plus
      : Database;
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
        <Icon className="h-3 w-3 animate-pulse" />
        <span>{label}...</span>
      </div>
    );
  }

  if (state === "output-available") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
        <CheckCircle2 className="h-3 w-3" />
        <span>{label}</span>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#DC2626]">
        <AlertCircle className="h-3 w-3" />
        <span>Failed: {label}</span>
      </div>
    );
  }

  return null;
}

// ============================================================
// THINKING BLOCK
// ============================================================

function ThinkingBlock({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-1 overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#F4F4F5]"
      >
        <Brain
          className={`h-3.5 w-3.5 shrink-0 ${
            isStreaming ? "animate-pulse text-[#8B5CF6]" : "text-[#A1A1AA]"
          }`}
        />
        <span className="flex-1 text-xs font-medium text-[#71717A]">
          {isStreaming ? "Thinking..." : "View reasoning"}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#A1A1AA] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-[#E4E4E7] px-3 py-3">
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#71717A]">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CSV DOWNLOAD BUTTON
// ============================================================

function CSVDownloadButton({
  csv,
  filename,
}: {
  csv: string;
  filename: string;
}) {
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
        <CheckCircle2 className="h-3 w-3" />
        <span>Export ready</span>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#3F3F46] transition-colors hover:bg-[#F4F4F5]"
      >
        <Download className="h-4 w-4" />
        <span>{filename}</span>
      </button>
    </div>
  );
}

// ============================================================
// MARKDOWN RENDERER
// ============================================================

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="mb-2 mt-3 text-base font-semibold text-[#0A0A0A]">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-3 text-sm font-semibold text-[#0A0A0A]">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-2 text-sm font-medium text-[#0A0A0A]">
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[#0A0A0A]">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[#3F3F46]">{children}</em>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block overflow-x-auto rounded-lg bg-[#0A0A0A] p-3 font-mono text-xs text-[#FAFAFA]">
              {children}
            </code>
          ) : (
            <code className="rounded bg-[#E4E4E7] px-1.5 py-0.5 font-mono text-xs text-[#3F3F46]">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded-lg bg-[#0A0A0A]">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-[#D4D4D8] pl-3 text-sm italic text-[#71717A]">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="mb-2 overflow-x-auto rounded-lg border border-[#E4E4E7]">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-[#E4E4E7] bg-[#F4F4F5] px-3 py-2 text-left text-xs font-semibold text-[#3F3F46]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-[#F4F4F5] px-3 py-2 text-xs text-[#3F3F46]">
            {children}
          </td>
        ),
        hr: () => <hr className="my-3 border-[#E4E4E7]" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ============================================================
// SUGGESTIONS
// ============================================================

const SUGGESTIONS = [
  "What projects are overdue?",
  "Show me recent leads",
  "How are my finances this month?",
  "What tasks are high priority?",
  "Create a task: Review Q2 report",
  "Export all projects to CSV",
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AIChatClient({ spaceId }: { spaceId: string }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { spaceId } }),
    [spaceId],
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";
  const isSubmitted = status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F4F5]">
                <Sparkles className="h-6 w-6 text-[#71717A]" />
              </div>
              <h2 className="mb-1 text-base font-medium text-[#0A0A0A]">
                Ask anything about your workspace
              </h2>
              <p className="mb-8 text-sm text-[#71717A]">
                I can read, create, delete data and export CSVs for projects,
                leads, tasks, and finances.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-[#E4E4E7] px-4 py-2 text-sm text-[#3F3F46] transition-colors hover:border-[#A1A1AA] hover:bg-[#FAFAFA]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Bot avatar */}
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5]">
                  <Bot className="h-4 w-4 text-[#71717A]" />
                </div>
              )}

              <div
                className={`flex max-w-[75%] flex-col gap-1.5 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {m.parts.map((part, index) => {
                  // ── User text ──
                  if (part.type === "text" && m.role === "user") {
                    return (
                      <div
                        key={index}
                        className="rounded-2xl rounded-br-sm bg-[#0A0A0A] px-4 py-2.5 text-sm leading-relaxed text-white"
                      >
                        <span className="whitespace-pre-wrap">{part.text}</span>
                      </div>
                    );
                  }

                  // ── AI text with markdown ──
                  if (part.type === "text" && part.text.trim()) {
                    return (
                      <div
                        key={index}
                        className="rounded-2xl rounded-bl-sm bg-[#F4F4F5] px-4 py-2.5 text-sm text-[#0A0A0A]"
                      >
                        <MarkdownContent content={part.text} />
                      </div>
                    );
                  }

                  // ── Reasoning / thinking ──
                  if (part.type === "reasoning") {
                    const isStreaming =
                      status === "streaming" && index === m.parts.length - 1;
                    return (
                      <div key={index} className="w-full">
                        <ThinkingBlock
                          text={part.text}
                          isStreaming={isStreaming}
                        />
                      </div>
                    );
                  }

                  // ── Tool parts ──
                  if (part.type.startsWith("tool-")) {
                    const toolPart = part as any;
                    const toolName = part.type.replace("tool-", "");

                    // CSV export — show download button
                    if (
                      toolName === "exportCSV" &&
                      toolPart.state === "output-available" &&
                      toolPart.output?.csv
                    ) {
                      return (
                        <div key={index} className="px-1">
                          <CSVDownloadButton
                            csv={toolPart.output.csv}
                            filename={toolPart.output.filename ?? "export.csv"}
                          />
                        </div>
                      );
                    }

                    // All other tools — status badge
                    return (
                      <div key={index} className="px-1">
                        <StatusBadge
                          state={toolPart.state}
                          toolName={toolName}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isSubmitted && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      <div className="px-4 pb-6 pt-2 md:px-8">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2 transition-shadow focus-within:border-[#A1A1AA] focus-within:shadow-sm"
          >
            <input
              ref={inputRef}
              className="flex-1 bg-transparent py-1.5 text-sm text-[#0A0A0A] placeholder:text-[#A1A1AA] focus:outline-none disabled:opacity-50"
              value={input}
              placeholder="Ask, create, delete, or export your data..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit(e as any);
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0A0A0A] text-white transition-all hover:bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-[#A1A1AA]">
            AI can make mistakes. Verify critical changes in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
