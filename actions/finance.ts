"use server";

import { prisma } from "@/lib/prisma";
import redis, { setCachedData, getCachedData, invalidateCache } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Expense, Income, RevenueGoal, TransactionCategory } from "@/lib/generated/client/client";

const expenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
  category: z.nativeEnum(TransactionCategory).optional(),
  currency: z.string().default("USD"),
  receiptUrl: z.string().optional(),
  isRecurring: z.boolean().default(false),
  cycle: z.string().optional(), // "monthly", "yearly"
  recurringDay: z.number().min(1).max(31).optional(),
  spaceId: z.string(),
  userId: z.string(),
  labelIds: z.array(z.string()).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

const incomeSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
  source: z.string().optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  currency: z.string().default("USD"),
  receiptUrl: z.string().optional(),
  isRecurring: z.boolean().default(false),
  cycle: z.string().optional(),
  recurringDay: z.number().min(1).max(31).optional(),
  spaceId: z.string(),
  userId: z.string(),
  labelIds: z.array(z.string()).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

const revenueGoalSchema = z.object({
  amount: z.number().positive(),
  month: z.number().min(1).max(12),
  year: z.number(),
  spaceId: z.string(),
  userId: z.string(),
});

// Helper for cache keys
const getFinanceCacheKey = (spaceId: string) => `finance:summary:${spaceId}`;

export async function addExpense(data: z.infer<typeof expenseSchema>) {
  try {
    const validated = expenseSchema.parse(data);
    
    const expense = await prisma.expense.create({
      data: {
        amount: validated.amount,
        description: validated.description,
        date: validated.date,
        category: validated.category,
        currency: validated.currency,
        receiptUrl: validated.receiptUrl,
        isRecurring: validated.isRecurring,
        cycle: validated.cycle,
        recurringDay: validated.recurringDay,
        spaceId: validated.spaceId,
        userId: validated.userId,
        labels: {
          connect: validated.labelIds?.map(id => ({ id })) || [],
        },
        ...(validated.clientId ? { clientId: validated.clientId } : {}),
        ...(validated.projectId ? { projectId: validated.projectId } : {}),
      },
    });

    await prisma.financialAuditLog.create({
      data: {
        userId: validated.userId,
        action: "CREATE",
        transactionId: expense.id,
        type: "EXPENSE",
        spaceId: validated.spaceId,
        diff: JSON.parse(JSON.stringify(expense))
      }
    });

    await invalidateCache(getFinanceCacheKey(validated.spaceId));
    revalidatePath("/dashboard/costs-expenses");
    return { success: true, data: expense };
  } catch (error) {
    console.error("[ADD_EXPENSE_ERROR]", error);
    return { success: false, error: "Failed to add expense" };
  }
}

export async function addIncome(data: z.infer<typeof incomeSchema>) {
  try {
    const validated = incomeSchema.parse(data);
    
    const income = await prisma.income.create({
      data: {
        amount: validated.amount,
        description: validated.description,
        date: validated.date,
        source: validated.source,
        category: validated.category,
        currency: validated.currency,
        receiptUrl: validated.receiptUrl,
        isRecurring: validated.isRecurring,
        cycle: validated.cycle,
        recurringDay: validated.recurringDay,
        spaceId: validated.spaceId,
        userId: validated.userId,
        labels: {
          connect: validated.labelIds?.map(id => ({ id })) || [],
        },
        ...(validated.clientId ? { clientId: validated.clientId } : {}),
        ...(validated.projectId ? { projectId: validated.projectId } : {}),
      },
    });

    await prisma.financialAuditLog.create({
      data: {
        userId: validated.userId,
        action: "CREATE",
        transactionId: income.id,
        type: "INCOME",
        spaceId: validated.spaceId,
        diff: JSON.parse(JSON.stringify(income))
      }
    });

    await invalidateCache(getFinanceCacheKey(validated.spaceId));
    revalidatePath("/dashboard/costs-expenses");
    return { success: true, data: income };
  } catch (error) {
    console.error("[ADD_INCOME_ERROR]", error);
    return { success: false, error: "Failed to add income" };
  }
}

export async function setRevenueGoal(data: z.infer<typeof revenueGoalSchema>) {
  try {
    const validated = revenueGoalSchema.parse(data);
    
    const goal = await prisma.revenueGoal.upsert({
      where: {
        spaceId_month_year: {
          spaceId: validated.spaceId,
          month: validated.month,
          year: validated.year,
        },
      },
      update: { amount: validated.amount },
      create: validated,
    });

    await invalidateCache(getFinanceCacheKey(validated.spaceId));
    revalidatePath("/dashboard/costs-expenses");
    return { success: true, data: goal };
  } catch (error) {
    console.error("[SET_REVENUE_GOAL_ERROR]", error);
    return { success: false, error: "Failed to set revenue goal" };
  }
}

export async function getFinancialSummary(spaceId: string) {
  try {
    const cacheKey = getFinanceCacheKey(spaceId);
    const cached = await getCachedData<{ months: any[] }>(cacheKey);
    if (cached) return cached;

    // Fetch last 6 months of data
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [expenses, incomes, goals] = await Promise.all([
      prisma.expense.findMany({
        where: { spaceId, date: { gte: sixMonthsAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.income.findMany({
        where: { spaceId, date: { gte: sixMonthsAgo } },
        orderBy: { date: "asc" },
      }),
      prisma.revenueGoal.findMany({
        where: { spaceId, year: now.getFullYear() },
      }),
    ]);

    // Simple currency converter function (mocked rates for MVP)
    const getRate = (currency: string) => {
      if (currency === "PLN") return 0.25; // 1 PLN = 0.25 USD
      if (currency === "EUR") return 1.08; // 1 EUR = 1.08 USD
      return 1; // default USD
    };

    const convertAmount = (amount: number, currency: string) => {
      return amount * getRate(currency);
    };

    // Aggregate by month
    const months: any[] = [];
    const pnlData: Record<string, { income: number, expense: number }> = {};
    const waterfallData: any[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = d.toLocaleString("default", { month: "short" });
      const monthIndex = d.getMonth() + 1;
      const year = d.getFullYear();

      const monthExpensesList = expenses.filter((e) => 
        new Date(e.date).getMonth() + 1 === monthIndex && 
        new Date(e.date).getFullYear() === year
      );
      
      const monthExpenses = monthExpensesList.reduce((acc, curr) => acc + convertAmount(curr.amount, curr.currency), 0);

      const monthIncomesList = incomes.filter((i) => 
        new Date(i.date).getMonth() + 1 === monthIndex && 
        new Date(i.date).getFullYear() === year
      );

      const monthIncomes = monthIncomesList.reduce((acc, curr) => acc + convertAmount(curr.amount, curr.currency), 0);

      const goal = goals.find((g) => g.month === monthIndex && g.year === year)?.amount || 0;

      // Calculate MoM for the latest month later
      months.push({
        name: monthName,
        expenses: monthExpenses,
        income: monthIncomes,
        goal,
      });

      // Populate P&L data for the last month (index 5 is the current/latest month in loop)
      if (i === 5) {
        monthIncomesList.forEach(inc => {
          const cat = inc.category || "Revenue";
          if (!pnlData[cat]) pnlData[cat] = { income: 0, expense: 0 };
          pnlData[cat].income += convertAmount(inc.amount, inc.currency);
        });
        monthExpensesList.forEach(exp => {
          const cat = exp.category || "Other";
          if (!pnlData[cat]) pnlData[cat] = { income: 0, expense: 0 };
          pnlData[cat].expense += convertAmount(exp.amount, exp.currency);
        });

        // Populate Waterfall Data (simplified: Initial -> +Incomes -> -Expenses -> Final)
        waterfallData.push({ name: "Starting", amount: 0, isTotal: true }); // Mock starting balance
        monthIncomesList.forEach(inc => waterfallData.push({ name: inc.category || "Revenue", amount: convertAmount(inc.amount, inc.currency) }));
        monthExpensesList.forEach(exp => waterfallData.push({ name: exp.category || "Expense", amount: -convertAmount(exp.amount, exp.currency) }));
        waterfallData.push({ name: "Ending", amount: monthIncomes - monthExpenses, isTotal: true });
      }
    }

    const currentMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];
    
    let incomeMom = 0;
    let expenseMom = 0;
    
    if (prevMonth) {
      incomeMom = prevMonth.income ? ((currentMonth.income - prevMonth.income) / prevMonth.income) * 100 : 0;
      expenseMom = prevMonth.expenses ? ((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100 : 0;
    }

    const profitMargin = currentMonth.income ? ((currentMonth.income - currentMonth.expenses) / currentMonth.income) * 100 : 0;

    const summary = { 
      months, 
      pnlData, 
      waterfallData,
      mom: { income: incomeMom, expenses: expenseMom },
      profitMargin
    };
    await setCachedData(cacheKey, summary, 3600); // Cache for 1 hour

    return summary;
  } catch (error) {
    console.error("[GET_FINANCE_SUMMARY_ERROR]", error);
    return { months: [], pnlData: {}, waterfallData: [], mom: { income: 0, expenses: 0 }, profitMargin: 0 };
  }
}

export async function createLabel(name: string, type: "EXPENSE" | "INCOME", spaceId: string, color?: string) {
  try {
    const label = await prisma.financialLabel.create({
      data: { name, type, spaceId, color },
    });
    revalidatePath("/dashboard/costs-expenses");
    return { success: true, data: label };
  } catch (error) {
    console.error("[CREATE_LABEL_ERROR]", error);
    return { success: false, error: "Failed to create label" };
  }
}

export async function getLabels(spaceId: string, type: "EXPENSE" | "INCOME") {
  try {
    return await prisma.financialLabel.findMany({
      where: { spaceId, type },
    });
  } catch (error) {
    console.error("[GET_LABELS_ERROR]", error);
    return [];
  }
}

export async function estimateFutureExpenses(spaceId: string, monthsCount: number) {
  try {
    const expenses = await prisma.expense.findMany({
      where: { spaceId },
    });

    // Simple estimation: sum of all recurring expenses + average of one-time expenses
    const recurringMonthly = expenses
      .filter((e: Expense) => e.isRecurring && e.cycle === "monthly")
      .reduce((acc: number, curr: Expense) => acc + curr.amount, 0);
    
    const oneTimeExpenses = expenses.filter((e: Expense) => !e.isRecurring);
    const oneTimeAvg = oneTimeExpenses.length > 0 
      ? oneTimeExpenses.reduce((acc: number, curr: Expense) => acc + curr.amount, 0) / Math.max(1, expenses.length / 12) / 12 // average per month over years
      : 0;

    const estimatedPerMonth = recurringMonthly + oneTimeAvg;
    
    return {
      estimatedPerMonth,
      totalForPeriod: estimatedPerMonth * monthsCount,
      recurringTotal: recurringMonthly * monthsCount,
      recurringExpenses: expenses.filter((e: Expense) => e.isRecurring)
    };
  } catch (error) {
    console.error("[ESTIMATE_EXPENSES_ERROR]", error);
    return null;
  }
}

export async function checkAnomaly(spaceId: string, category: TransactionCategory, amount: number, currency: string) {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await prisma.expense.findMany({
      where: {
        spaceId,
        category,
        date: { gte: threeMonthsAgo }
      }
    });

    if (expenses.length === 0) return false;

    // A simple average without complex currency conversion for the warning
    const avg = expenses.reduce((acc, curr) => acc + curr.amount, 0) / expenses.length;
    
    return amount > (avg * 2);
  } catch (error) {
    console.error("[CHECK_ANOMALY_ERROR]", error);
    return false;
  }
}

export async function getAuditLogs(spaceId: string) {
  try {
    return await prisma.financialAuditLog.findMany({
      where: { spaceId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } }
      }
    });
  } catch (error) {
    console.error("[GET_AUDIT_LOGS_ERROR]", error);
    return [];
  }
}
export async function getFinanceEntities(spaceId: string) {
  try {
    const [clients, projects] = await Promise.all([
      prisma.client.findMany({ where: { spaceId }, select: { id: true, name: true } }),
      prisma.project.findMany({ where: { spaceId }, select: { id: true, projectName: true } })
    ]);
    return {
      clients: clients.map(c => ({ id: c.id, name: c.name, type: 'CLIENT' })),
      projects: projects.map(p => ({ id: p.id, name: p.projectName, type: 'PROJECT' }))
    };
  } catch (error) {
    console.error("[GET_FINANCE_ENTITIES_ERROR]", error);
    return { clients: [], projects: [] };
  }
}
