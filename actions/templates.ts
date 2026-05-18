"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/session";
import { TEMPLATE_PRESETS } from "@/lib/templates/presets";
import { BrandingSettings, DEFAULT_BRANDING } from "@/types/templates";

interface Template {
  id: string;
  name: string;
  type: string;
  userId: string;
  spaceId: string | null;
  content: string;
  branding: BrandingSettings;
  blocks: unknown;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getTemplates(spaceId: string): Promise<{ success: boolean; templates?: Template[]; error?: string }> {
  const { userId } = await getUser();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const templates = await prisma.documentTemplate.findMany({
      where: { 
        OR: [
          { spaceId },
          { userId, spaceId: null }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    const mappedTemplates: Template[] = templates.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      userId: t.userId,
      spaceId: t.spaceId,
      content: t.content,
      branding: (t.branding as unknown as BrandingSettings) || DEFAULT_BRANDING,
      blocks: t.blocks,
      usageCount: t.usageCount,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    return { success: true, templates: mappedTemplates };
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

export async function getTemplateById(id: string): Promise<{ success: boolean; template?: Template; error?: string }> {
  try {
    const template = await prisma.documentTemplate.findUnique({
      where: { id }
    });
    if (!template) return { success: false, error: "Template not found" };
    
    const mappedTemplate: Template = {
      id: template.id,
      name: template.name,
      type: template.type,
      userId: template.userId,
      spaceId: template.spaceId,
      content: template.content,
      branding: (template.branding as unknown as BrandingSettings) || DEFAULT_BRANDING,
      blocks: template.blocks,
      usageCount: template.usageCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };

    return { success: true, template: mappedTemplate };
  } catch (error) {
    console.error("Failed to fetch template by ID:", error);
    return { success: false, error: "Failed to fetch template" };
  }
}

export async function createTemplate(data: {
  name: string;
  type: string;
  spaceId: string;
  presetId?: string;
}) {
  const { userId } = await getUser();
  if (!userId) return { success: false, error: "Unauthorized" };

  const preset = data.presetId ? TEMPLATE_PRESETS.find(p => p.id === data.presetId) : null;
  
  try {
    const template = await prisma.documentTemplate.create({
      data: {
        name: data.name,
        type: data.type,
        userId,
        spaceId: data.spaceId,
        content: preset?.content || "",
        branding: DEFAULT_BRANDING as unknown as Record<string, unknown>, // Prisma expects specific JSON type
        blocks: []
      }
    });
    revalidatePath('/dashboard/templates');
    return { success: true, id: template.id };
  } catch (error) {
    console.error("Failed to create template:", error);
    return { success: false, error: "Failed to create template" };
  }
}

export async function updateTemplate(id: string, data: {
  name?: string;
  content?: string;
  branding?: BrandingSettings;
  blocks?: unknown[];
}) {
  try {
    await prisma.documentTemplate.update({
      where: { id },
      data: {
        ...data,
        branding: data.branding ? (data.branding as Record<string, unknown>) : undefined,
        blocks: data.blocks ? (data.blocks as Record<string, unknown>[]) : undefined
      }
    });
    revalidatePath(`/dashboard/templates/${id}/edit`);
    revalidatePath('/dashboard/templates');
    return { success: true };
  } catch (error) {
    console.error("Failed to update template:", error);
    return { success: false, error: "Failed to update template" };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.documentTemplate.delete({
      where: { id }
    });
    revalidatePath('/dashboard/templates');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete template:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

export async function duplicateTemplate(id: string) {
  const { userId } = await getUser();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const original = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Original template not found" };

    const copy = await prisma.documentTemplate.create({
      data: {
        name: `Kopia: ${original.name}`,
        type: original.type,
        content: original.content,
        branding: original.branding as Record<string, unknown>,
        blocks: original.blocks as Record<string, unknown>[],
        userId,
        spaceId: original.spaceId
      }
    });
    revalidatePath('/dashboard/templates');
    return { success: true, id: copy.id };
  } catch (error) {
    console.error("Failed to duplicate template:", error);
    return { success: false, error: "Failed to duplicate template" };
  }
}

export async function getGeneratedDocuments(spaceId: string): Promise<{ success: boolean; documents?: Array<{ id: string; name: string }> ; error?: string }> {
  const { userId } = await getUser();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const documents = await prisma.generatedDocument.findMany({
      where: { spaceId },
      include: {
        template: {
          select: { name: true, type: true }
        },
        client: {
          select: { name: true }
        },
        project: {
          select: { projectName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, documents };
  } catch (error) {
    console.error("Failed to fetch generated documents:", error);
    return { success: false, error: "Failed to fetch generated documents" };
  }
}
