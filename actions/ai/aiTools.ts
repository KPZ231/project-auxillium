"use server";

import { prisma } from "@/lib/prisma";
import { ProjectStatus, LeadStatus, TransactionCategory } from "@/lib/generated/client/client";


// ============================================================
// READ
// ============================================================

export async function getProjectsForAI(spaceId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { spaceId },
      select: {
        id: true,
        projectName: true,
        projectDescription: true,
        projectStatus: true,
        priority: true,
        dueDate: true,
        budget: true,
        client: { select: { name: true } },
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    });

    return projects.map((p) => ({
      ...p,
      dueDate: p.dueDate?.toISOString().split("T")[0] ?? null,
    }));
  } catch (error) {
    console.error("Error fetching projects for AI:", error);
    return { error: "Failed to fetch projects." };
  }
}

export async function getLeadsForAI(spaceId: string) {
  try {
    const leads = await prisma.lead.findMany({
      where: { spaceId },
      select: {
        id: true,
        leadName: true,
        contactName: true,
        status: true,
        stage: true,
        email: true,
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    });
    return leads;
  } catch (error) {
    console.error("Error fetching leads for AI:", error);
    return { error: "Failed to fetch leads." };
  }
}

export async function getClientsForAI(spaceId: string) {
  try {
    const clients = await prisma.client.findMany({
      where: { spaceId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        description: true,
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients for AI:", error);
    return { error: "Failed to fetch clients." };
  }
}

export async function getTasksForAI(spaceId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { spaceId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        employee: { select: { name: true } },
        project: { select: { projectName: true } },
      },
      take: 30,
      orderBy: { updatedAt: "desc" },
    });
    return tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate?.toISOString().split("T")[0] ?? null,
    }));
  } catch (error) {
    console.error("Error fetching tasks for AI:", error);
    return { error: "Failed to fetch tasks." };
  }
}

export async function getFinancesForAI(spaceId: string) {
  try {
    const [expenses, incomes] = await Promise.all([
      prisma.expense.findMany({
        where: { spaceId },
        select: { id: true, amount: true, description: true, category: true, date: true },
        take: 15,
        orderBy: { date: "desc" },
      }),
      prisma.income.findMany({
        where: { spaceId },
        select: { id: true, amount: true, description: true, source: true, date: true },
        take: 15,
        orderBy: { date: "desc" },
      }),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);

    return {
      summary: { totalIncomes, totalExpenses, netBalance: totalIncomes - totalExpenses },
      expenses: expenses.map((e) => ({ ...e, date: e.date.toISOString().split("T")[0] })),
      incomes: incomes.map((i) => ({ ...i, date: i.date.toISOString().split("T")[0] })),
    };
  } catch (error) {
    console.error("Error fetching finances for AI:", error);
    return { error: "Failed to fetch financial data." };
  }
}

// ============================================================
// CREATE
// ============================================================

export async function createProjectForAI(
  spaceId: string,
  userId: string,
  data: {
    projectName: string;
    projectDescription: string;
    projectStatus?: ProjectStatus;
    priority?: string;
    budget?: string;
    dueDate?: string; // "YYYY-MM-DD"
  }
) {
  try {
    const project = await prisma.project.create({
      data: {
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        projectStatus: data.projectStatus ?? "IN_PROGRESS",
        priority: data.priority,
        budget: data.budget,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        spaceId,
        userId,
      },
    });
    return { success: true, id: project.id, projectName: project.projectName };
  } catch (error) {
    console.error("Error creating project for AI:", error);
    return { error: "Failed to create project." };
  }
}

export async function createLeadForAI(
  spaceId: string,
  userId: string,
  data: {
    leadName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    status?: LeadStatus;
    stage?: string;
  }
) {
  try {
    const lead = await prisma.lead.create({
      data: {
        leadName: data.leadName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        status: data.status ?? "COLD",
        stage: data.stage,
        spaceId,
        userId,
      },
    });
    return { success: true, id: lead.id, leadName: lead.leadName };
  } catch (error) {
    console.error("Error creating lead for AI:", error);
    return { error: "Failed to create lead." };
  }
}

export async function createTaskForAI(
  spaceId: string,
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    projectId?: string;
  }
) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status ?? "TODO",
        priority: data.priority ?? "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        projectId: data.projectId,
        spaceId,
      },
    });
    return { success: true, id: task.id, title: task.title };
  } catch (error) {
    console.error("Error creating task for AI:", error);
    return { error: "Failed to create task." };
  }
}

export async function createExpenseForAI(
  spaceId: string,
  userId: string,
  data: {
    amount: number;
    description?: string;
    category?: TransactionCategory;
    date?: string;
  }
) {
  try {
    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        spaceId,
        userId,
      },
    });
    return { success: true, id: expense.id, amount: expense.amount };
  } catch (error) {
    console.error("Error creating expense for AI:", error);
    return { error: "Failed to create expense." };
  }
}

export async function createIncomeForAI(
  spaceId: string,
  userId: string,
  data: {
    amount: number;
    description?: string;
    source?: string;
    date?: string;
  }
) {
  try {
    const income = await prisma.income.create({
      data: {
        amount: data.amount,
        description: data.description,
        source: data.source,
        date: data.date ? new Date(data.date) : new Date(),
        spaceId,
        userId,
      },
    });
    return { success: true, id: income.id, amount: income.amount };
  } catch (error) {
    console.error("Error creating income for AI:", error);
    return { error: "Failed to create income." };
  }
}

export async function createClientForAI(
  spaceId: string,
  userId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    description?: string;
    location?: string;
  }
) {
  try {
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        description: data.description,
        location: data.location,
        spaceId,
        userId,
      },
    });
    return { success: true, id: client.id, name: client.name };
  } catch (error) {
    console.error("Error creating client for AI:", error);
    return { error: "Failed to create client." };
  }
}

// ============================================================
// DELETE
// ============================================================

export async function deleteProjectForAI(spaceId: string, projectId: string) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, spaceId },
    });
    if (!project) return { error: "Project not found in this workspace." };

    await prisma.project.delete({ where: { id: projectId } });
    return { success: true, deleted: project.projectName };
  } catch (error) {
    console.error("Error deleting project for AI:", error);
    return { error: "Failed to delete project." };
  }
}

export async function deleteLeadForAI(spaceId: string, leadId: string) {
  try {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, spaceId } });
    if (!lead) return { error: "Lead not found in this workspace." };

    await prisma.lead.delete({ where: { id: leadId } });
    return { success: true, deleted: lead.leadName };
  } catch (error) {
    console.error("Error deleting lead for AI:", error);
    return { error: "Failed to delete lead." };
  }
}

export async function deleteTaskForAI(spaceId: string, taskId: string) {
  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, spaceId } });
    if (!task) return { error: "Task not found in this workspace." };

    await prisma.task.delete({ where: { id: taskId } });
    return { success: true, deleted: task.title };
  } catch (error) {
    console.error("Error deleting task for AI:", error);
    return { error: "Failed to delete task." };
  }
}

export async function deleteExpenseForAI(spaceId: string, expenseId: string) {
  try {
    const expense = await prisma.expense.findFirst({ where: { id: expenseId, spaceId } });
    if (!expense) return { error: "Expense not found in this workspace." };

    await prisma.expense.delete({ where: { id: expenseId } });
    return { success: true, deleted: `Expense of ${expense.amount}` };
  } catch (error) {
    console.error("Error deleting expense for AI:", error);
    return { error: "Failed to delete expense." };
  }
}

// ============================================================
// CSV EXPORT
// ============================================================

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = val == null ? "" : String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export async function exportProjectsCSV(spaceId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { spaceId },
      select: {
        id: true,
        projectName: true,
        projectDescription: true,
        projectStatus: true,
        priority: true,
        budget: true,
        dueDate: true,
        client: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows = projects.map((p) => ({
      id: p.id,
      name: p.projectName,
      description: p.projectDescription,
      status: p.projectStatus,
      priority: p.priority ?? "",
      budget: p.budget ?? "",
      dueDate: p.dueDate?.toISOString().split("T")[0] ?? "",
      client: p.client?.name ?? "",
    }));

    return { success: true, csv: toCSV(rows), filename: "projects.csv" };
  } catch (error) {
    console.error("Error exporting projects CSV:", error);
    return { error: "Failed to export projects." };
  }
}

export async function exportLeadsCSV(spaceId: string) {
  try {
    const leads = await prisma.lead.findMany({
      where: { spaceId },
      orderBy: { updatedAt: "desc" },
    });

    const rows = leads.map((l) => ({
      id: l.id,
      leadName: l.leadName,
      contactName: l.contactName ?? "",
      email: l.email ?? "",
      phone: l.phone ?? "",
      status: l.status,
      stage: l.stage ?? "",
    }));

    return { success: true, csv: toCSV(rows), filename: "leads.csv" };
  } catch (error) {
    console.error("Error exporting leads CSV:", error);
    return { error: "Failed to export leads." };
  }
}

export async function exportTasksCSV(spaceId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { spaceId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        employee: { select: { name: true } },
        project: { select: { projectName: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString().split("T")[0] ?? "",
      employee: t.employee?.name ?? "",
      project: t.project?.projectName ?? "",
    }));

    return { success: true, csv: toCSV(rows), filename: "tasks.csv" };
  } catch (error) {
    console.error("Error exporting tasks CSV:", error);
    return { error: "Failed to export tasks." };
  }
}

export async function exportFinancesCSV(spaceId: string) {
  try {
    const [expenses, incomes] = await Promise.all([
      prisma.expense.findMany({
        where: { spaceId },
        orderBy: { date: "desc" },
      }),
      prisma.income.findMany({
        where: { spaceId },
        orderBy: { date: "desc" },
      }),
    ]);

    const expenseRows = expenses.map((e) => ({
      type: "EXPENSE",
      id: e.id,
      amount: e.amount,
      description: e.description ?? "",
      category: e.category ?? "",
      source: "",
      date: e.date.toISOString().split("T")[0],
    }));

    const incomeRows = incomes.map((i) => ({
      type: "INCOME",
      id: i.id,
      amount: i.amount,
      description: i.description ?? "",
      category: "",
      source: i.source ?? "",
      date: i.date.toISOString().split("T")[0],
    }));

    return {
      success: true,
      csv: toCSV([...incomeRows, ...expenseRows]),
      filename: "finances.csv",
    };
  } catch (error) {
    console.error("Error exporting finances CSV:", error);
    return { error: "Failed to export finances." };
  }
}