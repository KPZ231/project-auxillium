"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { getActiveSpaceId } from "@/actions/space";

export interface TutorialStatus {
  currentStep: number;
  completedSteps: boolean[];
  dismissed: boolean;
}

const TOTAL_STEPS = 7;

export async function getTutorialStatus(): Promise<TutorialStatus> {
  const { userId } = await getUser();
  if (!userId) {
    return { currentStep: 0, completedSteps: Array(TOTAL_STEPS).fill(false), dismissed: false };
  }

  const spaceId = await getActiveSpaceId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tutorialStep: true, tutorialDismissed: true },
  });

  if (!user || user.tutorialDismissed) {
    return {
      currentStep: user?.tutorialStep ?? 0,
      completedSteps: Array(TOTAL_STEPS).fill(false),
      dismissed: true,
    };
  }

  if (!spaceId || user.tutorialStep >= TOTAL_STEPS) {
    return {
      currentStep: user.tutorialStep,
      completedSteps: Array(TOTAL_STEPS).fill(true),
      dismissed: user.tutorialDismissed,
    };
  }

  const [projectCount, clientCount, templateCount, expenseCount, leadCount, taskCount, employeeCount] =
    await Promise.all([
      prisma.project.count({ where: { spaceId } }),
      prisma.client.count({ where: { spaceId } }),
      prisma.documentTemplate.count({ where: { spaceId } }),
      prisma.expense.count({ where: { spaceId } }),
      prisma.lead.count({ where: { spaceId } }),
      prisma.task.count({ where: { spaceId } }),
      prisma.employee.count({ where: { spaceId } }),
    ]);

  const completedSteps = [
    projectCount > 0,
    clientCount > 0,
    templateCount > 0,
    expenseCount > 0,
    leadCount > 0,
    taskCount > 0,
    employeeCount > 0,
  ];

  // Advance tutorialStep to match actual completed steps
  let newStep = user.tutorialStep;
  for (let i = 0; i < TOTAL_STEPS; i++) {
    if (completedSteps[i] && newStep <= i) {
      newStep = i + 1;
    }
  }

  if (newStep !== user.tutorialStep) {
    await prisma.user.update({
      where: { id: userId },
      data: { tutorialStep: newStep },
    });
  }

  return { currentStep: newStep, completedSteps, dismissed: false };
}

export async function dismissTutorial(): Promise<void> {
  const { userId } = await getUser();
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { tutorialDismissed: true },
  });
}
