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
  Briefcase,
  Users,
  Target,
  Link2,
} from "lucide-react";
import { SiGooglesheets, SiGoogledrive, SiGoogledocs, SiGooglecalendar, SiGoogletasks } from "react-icons/si";
import { ConnectorModal } from "@/app/components/settings/ConnectorModal";
import { ConnectorType, getConnectedServices } from "@/actions/connectors";
import { DefaultChatTransport } from "ai";
import { getProjects } from "@/actions/getProjects";
import { getLeads } from "@/actions/getLeads";
import { getClients } from "@/actions/clients";
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
  saveToGoogleDocs: "Saving to Google Docs",
  addToGoogleSheet: "Adding to Google Sheets",
  createGoogleCalendarEvent: "Creating calendar event",
  createGoogleTask: "Adding to Google Tasks",
  uploadToGoogleDrive: "Uploading to Google Drive",
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
// EXTERNAL LINK BUTTON
// ============================================================

function ExternalLinkButton({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
        <CheckCircle2 className="h-3 w-3" />
        <span>Action completed</span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#3F3F46] transition-colors hover:bg-[#F4F4F5]"
      >
        <Plus className="h-4 w-4" />
        <span>View {label}</span>
      </a>
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

interface ToolPart {
  type: string;
  state: string;
  output?: {
    csv?: string;
    filename?: string;
    url?: string;
    title?: string;
    summary?: string;
  };
}

interface MentionItem {
  id: string;
  name: string;
  type: 'project' | 'client' | 'lead';
}

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
  const [mentionItems, setMentionItems] = useState<MentionItem[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Connector state
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [activeConnector, setActiveConnector] = useState<{ name: string; type: ConnectorType } | null>(null);
  const [connectedServices, setConnectedServices] = useState<Record<ConnectorType, boolean>>({
    google_sheets: false,
    google_drive: false,
    google_docs: false,
    google_calendar: false,
    google_tasks: false,
  });
  const [showConnectors, setShowConnectors] = useState(false);

  const fetchServices = async () => {
    const res = await getConnectedServices();
    if (res.success && res.data) {
      setConnectedServices(res.data);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, []);

  const openConnectorModal = (name: string, type: ConnectorType) => {
    setActiveConnector({ name, type });
    setIsConnectorModalOpen(true);
    setShowConnectors(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [projRes, leadRes, clientRes] = await Promise.all([
        getProjects(),
        getLeads(),
        getClients()
      ]);

      const items: MentionItem[] = [];
      if (projRes.success) {
        items.push(...(projRes.data || []).map((p: { id: string; projectName: string }) => ({ id: p.id, name: p.projectName, type: 'project' as const })));
      }
      if (leadRes.success) {
        items.push(...(leadRes.data || []).map((l: { id: string; leadName: string }) => ({ id: l.id, name: l.leadName, type: 'lead' as const })));
      }
      if (Array.isArray(clientRes)) {
        items.push(...clientRes.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name, type: 'client' as const })));
      }
      setMentionItems(items);
    };
    fetchData();
  }, []);

  const filteredMentions = useMemo(() => {
    if (!mentionSearch) return mentionItems;
    return mentionItems.filter(item => 
      item.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [mentionItems, mentionSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const query = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!query.includes(" ")) {
        setMentionSearch(query);
        setShowMentions(true);
        setSelectedIndex(0);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (item: { id: string; name: string; type: string }) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = input.slice(0, cursorPosition);
    const textAfterCursor = input.slice(cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    const newVal = 
      input.slice(0, lastAtSymbol) + 
      `@${item.name} ` + 
      textAfterCursor;

    setInput(newVal);
    setShowMentions(false);
    
    // Maintain a hidden list of mentions to swap on submit
    // For now, we'll just format it directly in the text on submit
    
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = lastAtSymbol + item.name.length + 2;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Process mentions: find @name and replace with structured text if it matches an item
    let processedInput = input;
    mentionItems.forEach(item => {
      const mentionText = `@${item.name}`;
      if (processedInput.includes(mentionText)) {
        // Replace with a format the AI can understand
        const replacement = `[${item.name}](entity:${item.type}:${item.id})`;
        processedInput = processedInput.replaceAll(mentionText, replacement);
      }
    });

    sendMessage({ text: processedInput });
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
                    const toolPart = part as unknown as ToolPart;
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

                    // Google Service Actions — show link button
                    if (
                      ["saveToGoogleDocs", "addToGoogleSheet", "createGoogleCalendarEvent"].includes(toolName) &&
                      toolPart.state === "output-available" &&
                      toolPart.output?.url
                    ) {
                      return (
                        <div key={index} className="px-1">
                          <ExternalLinkButton
                            url={toolPart.output.url}
                            label={toolPart.output.title || toolPart.output.summary || "Link"}
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
          <div className="relative">
            {showMentions && filteredMentions.length > 0 && (
              <div className="absolute bottom-full mb-2 w-full overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-xl">
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredMentions.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => insertMention(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                        index === selectedIndex ? "bg-[#F4F4F5]" : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F4F4F5]">
                        {item.type === 'project' && <Briefcase className="h-3.5 w-3.5 text-[#71717A]" />}
                        {item.type === 'client' && <Users className="h-3.5 w-3.5 text-[#71717A]" />}
                        {item.type === 'lead' && <Target className="h-3.5 w-3.5 text-[#71717A]" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate font-medium text-[#0A0A0A]">{item.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">{item.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showConnectors && (
              <div className="absolute bottom-full mb-2 right-0 w-64 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-xl">
                <div className="p-3 border-b border-[#F4F4F5]">
                  <h3 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">Connectors</h3>
                </div>
                <div className="p-1">
                  {[
                    { name: "Google Docs", type: "google_docs", icon: SiGoogledocs },
                    { name: "Google Sheets", type: "google_sheets", icon: SiGooglesheets },
                    { name: "Google Drive", type: "google_drive", icon: SiGoogledrive },
                    { name: "Google Calendar", type: "google_calendar", icon: SiGooglecalendar },
                    { name: "Google To Do", type: "google_tasks", icon: SiGoogletasks },
                  ].map((service) => (
                    <button
                      key={service.type}
                      onClick={() => openConnectorModal(service.name, service.type as ConnectorType)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#F4F4F5] transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F4F5] group-hover:bg-white transition-colors">
                        <service.icon className="h-4 w-4 text-[#0A0A0A]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#0A0A0A]">{service.name}</span>
                          {connectedServices[service.type as ConnectorType] && (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#71717A]">
                          {connectedServices[service.type as ConnectorType] ? "Connected" : "Not connected"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2 transition-shadow focus-within:border-[#A1A1AA] focus-within:shadow-sm"
            >
              <button
                type="button"
                onClick={() => setShowConnectors(!showConnectors)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                  showConnectors ? "bg-[#0A0A0A] text-white" : "text-[#71717A] hover:bg-[#F4F4F5]"
                }`}
              >
                <Link2 className="h-4 w-4" />
              </button>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent py-1.5 text-sm text-[#0A0A0A] placeholder:text-[#A1A1AA] focus:outline-none disabled:opacity-50"
                value={input}
                placeholder="Ask @projects, @clients, or @leads..."
                onChange={handleInputChange}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (showMentions && filteredMentions.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedIndex((prev) => (prev + 1) % filteredMentions.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedIndex((prev) => (prev - 1 + filteredMentions.length) % filteredMentions.length);
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      insertMention(filteredMentions[selectedIndex]);
                    } else if (e.key === "Escape") {
                      setShowMentions(false);
                    }
                  } else if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
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
          </div>
          <p className="mt-2 text-center text-xs text-[#A1A1AA]">
            AI can make mistakes. Verify critical changes in your dashboard.
          </p>
        </div>
      </div>

      {/* Modals */}
      {activeConnector && (
        <ConnectorModal
          isOpen={isConnectorModalOpen}
          onClose={() => setIsConnectorModalOpen(false)}
          connectorName={activeConnector.name}
          connectorType={activeConnector.type}
          isConnected={connectedServices[activeConnector.type]}
          onSuccess={(isConnected) => {
            setConnectedServices(prev => ({ ...prev, [activeConnector.type]: isConnected }));
            fetchServices();
          }}
        />
      )}
    </div>
  );
}
