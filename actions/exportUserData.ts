"use server";

import { getUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface ExportedUserData {
  user: {
    id: string;
    email: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    createdAt: string;
    lastActiveSpaceId: string | null;
  };
  spaces: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    createdAt: string;
    isOwner: boolean;
    memberCount: number;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    dueDate: string | null;
  }[];
  leads: {
    id: string;
    name: string;
    projectType: string | null;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    status: string;
    stage: string | null;
    createdAt: string;
  }[];
  clients: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    description: string | null;
    notes: string | null;
    createdAt: string;
  }[];
  employees: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    createdAt: string;
  }[];
  tasks: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    createdAt: string;
  }[];
  expenses: {
    id: string;
    amount: number;
    description: string | null;
    date: string;
    category: string | null;
    isRecurring: boolean;
    cycle: string | null;
    createdAt: string;
  }[];
  incomes: {
    id: string;
    amount: number;
    description: string | null;
    date: string;
    source: string | null;
    createdAt: string;
  }[];
}

async function fetchDataForSpace(
  spaceId: string,
  userId: string
): Promise<{
  spaces: { id: string; spaceName: string; spaceDescription: string | null; icon: string | null; createdAt: Date; ownerId: string; owner: { email: string }; members: { id: string }[] }[];
  projects: { id: string; projectName: string; projectDescription: string; projectStatus: string; createdAt: Date; dueDate: Date | null }[];
  leads: { id: string; leadName: string; projectType: string | null; contactName: string | null; email: string | null; phone: string | null; status: string; stage: string | null; createdAt: Date }[];
  clients: { id: string; name: string; email: string | null; phone: string | null; description: string | null; notes: string | null; createdAt: Date }[];
  employees: { id: string; name: string; email: string | null; phone: string | null; role: string | null; createdAt: Date }[];
  tasks: { id: string; title: string; description: string | null; status: string; priority: string; dueDate: Date | null; createdAt: Date }[];
  expenses: { id: string; amount: number; description: string | null; date: Date; category: string | null; isRecurring: boolean; cycle: string | null; createdAt: Date }[];
  incomes: { id: string; amount: number; description: string | null; date: Date; source: string | null; createdAt: Date }[];
}> {
  const spaces = await prisma.space.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: {
      id: true,
      spaceName: true,
      spaceDescription: true,
      icon: true,
      createdAt: true,
      ownerId: true,
      owner: {
        select: { email: true },
      },
      members: {
        select: { id: true },
      },
    },
  });

  const projects = await prisma.project.findMany({
    where: { userId },
    select: {
      id: true,
      projectName: true,
      projectDescription: true,
      projectStatus: true,
      createdAt: true,
      dueDate: true,
    },
  });

  const leads = await prisma.lead.findMany({
    where: { userId },
    select: {
      id: true,
      leadName: true,
      projectType: true,
      contactName: true,
      email: true,
      phone: true,
      status: true,
      stage: true,
      createdAt: true,
    },
  });

  const clients = await prisma.client.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      description: true,
      notes: true,
      createdAt: true,
    },
  });

  const employees = await prisma.employee.findMany({
    where: { spaceId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const tasks = await prisma.task.findMany({
    where: { spaceId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
    },
  });

  const expenses = await prisma.expense.findMany({
    where: { userId },
    select: {
      id: true,
      amount: true,
      description: true,
      date: true,
      category: true,
      isRecurring: true,
      cycle: true,
      createdAt: true,
    },
  });

  const incomes = await prisma.income.findMany({
    where: { userId },
    select: {
      id: true,
      amount: true,
      description: true,
      date: true,
      source: true,
      createdAt: true,
    },
  });

  return {
    spaces,
    projects,
    leads,
    clients,
    employees,
    tasks,
    expenses,
    incomes,
  };
}

export async function exportUserData(): Promise<{
  success: boolean;
  csvContent?: string;
  error?: string;
}> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        lastActiveSpaceId: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const data = await fetchDataForSpace(
      user.lastActiveSpaceId || "",
      userId
    );

    const exportedData: ExportedUserData = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        lastActiveSpaceId: user.lastActiveSpaceId,
      },
      spaces: data.spaces.map((s) => ({
        id: s.id,
        name: s.spaceName,
        description: s.spaceDescription,
        icon: s.icon,
        createdAt: s.createdAt.toISOString(),
        isOwner: s.ownerId === userId,
        memberCount: s.members.length,
      })),
      projects: data.projects.map((p) => ({
        id: p.id,
        name: p.projectName,
        description: p.projectDescription,
        status: p.projectStatus,
        createdAt: p.createdAt.toISOString(),
        dueDate: p.dueDate?.toISOString() || null,
      })),
      leads: data.leads.map((l) => ({
        id: l.id,
        name: l.leadName,
        projectType: l.projectType,
        contactName: l.contactName,
        email: l.email,
        phone: l.phone,
        status: l.status,
        stage: l.stage,
        createdAt: l.createdAt.toISOString(),
      })),
      clients: data.clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        description: c.description,
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
      })),
      employees: data.employees.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        role: e.role,
        createdAt: e.createdAt.toISOString(),
      })),
      tasks: data.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
      })),
      expenses: data.expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        description: e.description,
        date: e.date.toISOString(),
        category: e.category,
        isRecurring: e.isRecurring,
        cycle: e.cycle,
        createdAt: e.createdAt.toISOString(),
      })),
      incomes: data.incomes.map((i) => ({
        id: i.id,
        amount: i.amount,
        description: i.description,
        date: i.date.toISOString(),
        source: i.source,
        createdAt: i.createdAt.toISOString(),
      })),
    };

    const csvContent = convertToCSV(exportedData);

    return {
      success: true,
      csvContent,
    };
  } catch (error) {
    console.error("[EXPORT_USER_DATA_ERROR]", error);
    return { success: false, error: "Failed to export user data" };
  }
}

function convertToCSV(data: ExportedUserData): string {
  const rows: string[] = [];

  // User info
  rows.push("=== USER INFO ===");
  rows.push(`User ID: ${data.user.id}`);
  rows.push(`Email: ${data.user.email}`);
  rows.push(`Username: ${data.user.username}`);
  rows.push(`Display Name: ${data.user.name || "N/A"}`);
  rows.push(`Avatar URL: ${data.user.avatarUrl || "N/A"}`);
  rows.push(`Created: ${data.user.createdAt}`);
  rows.push(`Last Active Space: ${data.user.lastActiveSpaceId || "N/A"}`);
  rows.push("");

  // Spaces
  rows.push("=== SPACES ===");
  rows.push("ID,Name,Description,Icon,Created,Is Owner,Member Count");
  data.spaces.forEach((s) => {
    rows.push(
      `${s.id},${escapeCSV(s.name)},${escapeCSV(
        s.description || ""
      )},${s.icon || ""},${s.createdAt},${s.isOwner},${s.memberCount}`
    );
  });
  rows.push("");

  // Projects
  rows.push("=== PROJECTS ===");
  rows.push(
    "ID,Name,Description,Status,Created,Due Date,Budget,Location,Type,Priority"
  );
  data.projects.forEach((p) => {
    rows.push(
      `${p.id},${escapeCSV(p.name)},${escapeCSV(
        p.description
      )},${p.status},${p.createdAt},${p.dueDate || ""}`
    );
  });
  rows.push("");

  // Leads
  rows.push("=== LEADS ===");
  rows.push(
    "ID,Name,Project Type,Contact Name,Email,Phone,Status,Stage,Created"
  );
  data.leads.forEach((l) => {
    rows.push(
      `${l.id},${escapeCSV(l.name)},${l.projectType || ""},${l.contactName ||
        ""},${l.email || ""},${l.phone || ""},${l.status},${l.stage ||
        ""},${l.createdAt}`
    );
  });
  rows.push("");

  // Clients
  rows.push("=== CLIENTS ===");
  rows.push("ID,Name,Email,Phone,Description,Notes,Created");
  data.clients.forEach((c) => {
    rows.push(
      `${c.id},${escapeCSV(c.name)},${c.email || ""},${c.phone ||
        ""},${escapeCSV(c.description || "")},${escapeCSV(
        c.notes || ""
      )},${c.createdAt}`
    );
  });
  rows.push("");

  // Tasks
  rows.push("=== TASKS ===");
  rows.push("ID,Title,Description,Status,Priority,Due Date,Created");
  data.tasks.forEach((t) => {
    rows.push(
      `${t.id},${escapeCSV(t.title)},${escapeCSV(
        t.description || ""
      )},${t.status},${t.priority},${t.dueDate || ""},${t.createdAt}`
    );
  });
  rows.push("");

  // Expenses
  rows.push("=== EXPENSES ===");
  rows.push(
    "ID,Amount,Description,Date,Category,Is Recurring,Cycle,Created"
  );
  data.expenses.forEach((e) => {
    rows.push(
      `${e.id},${e.amount},${escapeCSV(
        e.description || ""
      )},${e.date},${e.category || ""},${e.isRecurring},${e.cycle ||
        ""},${e.createdAt}`
    );
  });
  rows.push("");

  // Incomes
  rows.push("=== INCOMES ===");
  rows.push("ID,Amount,Description,Date,Source,Created");
  data.incomes.forEach((i) => {
    rows.push(
      `${i.id},${i.amount},${escapeCSV(
        i.description || ""
      )},${i.date},${i.source || ""},${i.createdAt}`
    );
  });

  return rows.join("\n");
}

function escapeCSV(value: string): string {
  if (value === undefined || value === null) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
