"use server";

import { prisma } from "@/lib/prisma";
import redis, { setCachedData, getCachedData, invalidateCache } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Expense, Income, RevenueGoal } from "@/lib/generated/client/client";

const expenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
  category: z.string().optional(),
  isRecurring: z.boolean().default(false),
  cycle: z.string().optional(), // "monthly", "yearly"
  spaceId: z.string(),
  userId: z.string(),
  labelIds: z.array(z.string()).optional(),
});

const incomeSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
  source: z.string().optional(),
  spaceId: z.string(),
  userId: z.string(),
  labelIds: z.array(z.string()).optional(),
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
        isRecurring: validated.isRecurring,
        cycle: validated.cycle,
        spaceId: validated.spaceId,
        userId: validated.userId,
        labels: {
          connect: validated.labelIds?.map(id => ({ id })) || [],
        },
      },
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
        spaceId: validated.spaceId,
        userId: validated.userId,
        labels: {
          connect: validated.labelIds?.map(id => ({ id })) || [],
        },
      },
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
    const cached = await getCachedData(cacheKey);
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

    // Aggregate by month
    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = d.toLocaleString("default", { month: "short" });
      const monthIndex = d.getMonth() + 1;
      const year = d.getFullYear();

      const monthExpenses = expenses.filter((e: Expense) => 
        new Date(e.date).getMonth() + 1 === monthIndex && 
        new Date(e.date).getFullYear() === year
      ).reduce((acc: number, curr: Expense) => acc + curr.amount, 0);

      const monthIncomes = incomes.filter((i: Income) => 
        new Date(i.date).getMonth() + 1 === monthIndex && 
        new Date(i.date).getFullYear() === year
      ).reduce((acc: number, curr: Income) => acc + curr.amount, 0);

      const goal = goals.find((g: RevenueGoal) => g.month === monthIndex && g.year === year)?.amount || 0;

      months.push({
        name: monthName,
        expenses: monthExpenses,
        income: monthIncomes,
        goal,
      });
    }

    const summary = { months };
    await setCachedData(cacheKey, summary, 3600); // Cache for 1 hour

    return summary;
  } catch (error) {
    console.error("[GET_FINANCE_SUMMARY_ERROR]", error);
    return { months: [] };
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
    };
  } catch (error) {
    console.error("[ESTIMATE_EXPENSES_ERROR]", error);
    return null;
  }
}
