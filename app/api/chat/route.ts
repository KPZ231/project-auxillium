import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  streamText,
  tool,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { getActiveSpaceId } from "@/actions/space";
import { getUser } from "@/lib/session";
import {
  getProjectsForAI,
  getLeadsForAI,
  getClientsForAI,
  getTasksForAI,
  getFinancesForAI,
  createProjectForAI,
  createLeadForAI,
  createTaskForAI,
  createExpenseForAI,
  createIncomeForAI,
  createClientForAI,
  deleteProjectForAI,
  deleteLeadForAI,
  deleteTaskForAI,
  deleteExpenseForAI,
  exportProjectsCSV,
  exportLeadsCSV,
  exportTasksCSV,
  exportFinancesCSV,
} from "@/actions/ai/aiTools";
import {
  saveToGoogleDocs,
  addToGoogleSheet,
  createGoogleCalendarEvent,
  createGoogleTask,
  uploadToGoogleDrive,
} from "@/actions/ai/googleTools";

export const maxDuration = 30;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];

    if (!messages.length) {
      return new Response("No messages provided", { status: 400 });
    }

    const { userId } = await getUser();
    const spaceId = await getActiveSpaceId();

    if (!userId || !spaceId) {
      return new Response("Unauthorized or no active space", { status: 401 });
    }

    const result = streamText({
      model: openrouter("openai/gpt-oss-120b:free"),
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      system: `You are an intelligent business assistant for the Auxilium CRM application. 
      You help users manage their projects, leads, clients, tasks, and finances. 
      You always query the database using your tools when users ask about their business data. 
      
      GOOGLE SERVICES:
      You have access to Google Docs, Sheets, Calendar, Tasks, and Drive. 
      - Use these tools when the user explicitly asks to save, export, or schedule something to their Google account.
      - Always check if the tool execution was successful and provide the link to the created document/event if available.
      
      MENTIONS:
      Users can mention specific entities using the format [Name](entity:type:id). 
      - When you see this format, you have the direct ID of the entity. 
      - Use this ID directly in tool calls (e.g., projectId, leadId, clientId) without needing to fetch it first if the user's intent is clear.
      
      When creating new records (projects, leads, clients, tasks), ensure you have the required information. 
      If the user's request is missing required fields (like a name for a client or project), ask them to provide the missing details before proceeding with the tool call.
      If you cannot find the answer in the retrieved data, state that clearly.
      Do not invent or hallucinate data. 
      Respond concisely and professionally.`,
      tools: {
        fetchProjects: tool({
          description:
            "Fetch the recent projects for the current workspace to answer questions about projects, their status, deadlines, and budgets.",
          inputSchema: z.object({}),
          execute: async () => await getProjectsForAI(spaceId),
        }),
        fetchLeads: tool({
          description:
            "Fetch the recent leads for the current workspace to answer questions about prospective clients, sales pipeline, and contact info.",
          inputSchema: z.object({}),
          execute: async () => await getLeadsForAI(spaceId),
        }),
        fetchClients: tool({
          description:
            "Fetch the recent clients for the current workspace to answer questions about client details.",
          inputSchema: z.object({}),
          execute: async () => await getClientsForAI(spaceId),
        }),
        fetchTasks: tool({
          description:
            "Fetch the recent tasks for the current workspace to answer questions about what needs to be done, priorities, and assignments.",
          inputSchema: z.object({}),
          execute: async () => await getTasksForAI(spaceId),
        }),
        fetchFinances: tool({
          description:
            "Fetch the recent incomes and expenses for the current workspace to answer questions about financial health, costs, and revenue.",
          inputSchema: z.object({}),
          execute: async () => await getFinancesForAI(spaceId),
        }),
        createProject: tool({
          description: "Create a new project in the workspace.",
          inputSchema: z.object({
            projectName: z.string(),
            projectDescription: z.string(),
            projectStatus: z
              .enum(["IN_PROGRESS", "DONE", "CANCELED"])
              .optional(),
            priority: z.string().optional(),
            budget: z.string().optional(),
            dueDate: z.string().optional(), // "YYYY-MM-DD"
          }),
          execute: async (data) =>
            await createProjectForAI(spaceId, userId, data),
        }),

        createLead: tool({
          description: "Create a new lead in the workspace.",
          inputSchema: z.object({
            leadName: z.string(),
            contactName: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            status: z.enum(["COLD", "QUALIFIED", "NEGOTIATION"]).optional(),
            stage: z.string().optional(),
          }),
          execute: async (data) => await createLeadForAI(spaceId, userId, data),
        }),

        createTask: tool({
          description: "Create a new task in the workspace.",
          inputSchema: z.object({
            title: z.string(),
            description: z.string().optional(),
            status: z.string().optional(),
            priority: z.string().optional(),
            dueDate: z.string().optional(),
            projectId: z.string().optional(),
          }),
          execute: async (data) => await createTaskForAI(spaceId, data),
        }),

        createExpense: tool({
          description: "Create a new expense entry.",
          inputSchema: z.object({
            amount: z.number(),
            description: z.string().optional(),
            category: z.string().optional(),
            date: z.string().optional(),
          }),
          execute: async (data) =>
            await createExpenseForAI(spaceId, userId, data),
        }),

        createIncome: tool({
          description: "Create a new income entry.",
          inputSchema: z.object({
            amount: z.number(),
            description: z.string().optional(),
            source: z.string().optional(),
            date: z.string().optional(),
          }),
          execute: async (data) =>
            await createIncomeForAI(spaceId, userId, data),
        }),
        createClient: tool({
          description: "Create a new client in the workspace.",
          inputSchema: z.object({
            name: z.string().min(2, "Client name must be at least 2 characters."),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            description: z.string().optional(),
            location: z.string().optional(),
          }),
          execute: async (data) =>
            await createClientForAI(spaceId, userId, data),
        }),

        deleteProject: tool({
          description: "Delete a project by ID.",
          inputSchema: z.object({ projectId: z.string() }),
          execute: async ({ projectId }) =>
            await deleteProjectForAI(spaceId, projectId),
        }),

        deleteLead: tool({
          description: "Delete a lead by ID.",
          inputSchema: z.object({ leadId: z.string() }),
          execute: async ({ leadId }) => await deleteLeadForAI(spaceId, leadId),
        }),

        deleteTask: tool({
          description: "Delete a task by ID.",
          inputSchema: z.object({ taskId: z.string() }),
          execute: async ({ taskId }) => await deleteTaskForAI(spaceId, taskId),
        }),

        deleteExpense: tool({
          description: "Delete an expense by ID.",
          inputSchema: z.object({ expenseId: z.string() }),
          execute: async ({ expenseId }) =>
            await deleteExpenseForAI(spaceId, expenseId),
        }),

        exportCSV: tool({
          description:
            "Generate and return a CSV file for projects, leads, tasks, or finances. Returns CSV content for download.",
          inputSchema: z.object({
            entity: z.enum(["projects", "leads", "tasks", "finances"]),
          }),
          execute: async ({ entity }) => {
            if (entity === "projects") return exportProjectsCSV(spaceId);
            if (entity === "leads") return exportLeadsCSV(spaceId);
            if (entity === "tasks") return exportTasksCSV(spaceId);
            return exportFinancesCSV(spaceId);
          },
        }),
        saveToGoogleDocs: tool({
          description: "Save content to a new Google Doc.",
          inputSchema: z.object({
            title: z.string(),
            content: z.string(),
          }),
          execute: async (data) => await saveToGoogleDocs(userId, data),
        }),
        addToGoogleSheet: tool({
          description: "Append rows of data to a Google Sheet.",
          inputSchema: z.object({
            spreadsheetTitle: z.string(),
            rows: z.array(z.array(z.any())),
          }),
          execute: async (data) => await addToGoogleSheet(userId, data),
        }),
        createGoogleCalendarEvent: tool({
          description: "Create an event in Google Calendar.",
          inputSchema: z.object({
            summary: z.string(),
            description: z.string().optional(),
            start: z.string().describe("ISO datetime string"),
            end: z.string().describe("ISO datetime string"),
          }),
          execute: async (data) => await createGoogleCalendarEvent(userId, data),
        }),
        createGoogleTask: tool({
          description: "Add a task to Google Tasks (To Do).",
          inputSchema: z.object({
            title: z.string(),
            notes: z.string().optional(),
            due: z.string().optional().describe("ISO datetime string"),
          }),
          execute: async (data) => await createGoogleTask(userId, data),
        }),
        uploadToGoogleDrive: tool({
          description: "Upload content as a file to Google Drive.",
          inputSchema: z.object({
            filename: z.string(),
            content: z.string(),
            mimeType: z.string().optional(),
          }),
          execute: async (data) => await uploadToGoogleDrive(userId, data),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("An error occurred during chat processing.", {
      status: 500,
    });
  }
}
