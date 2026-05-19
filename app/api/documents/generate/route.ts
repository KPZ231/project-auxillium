import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { getTemplateContextData, replaceVariables } from "@/lib/templates/data-fetcher";
import { generatePDF, markdownToHtml } from "@/lib/templates/pdf-generator";
import { BrandingSettings } from "@/types/templates";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { templateId, clientId, dealId, spaceId } = body;

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    // 1. Fetch context data
    const context = await getTemplateContextData(clientId, dealId, userId);

    // 2. Process content
    const processedMarkdown = replaceVariables(template.content, context);
    const htmlContent = await markdownToHtml(processedMarkdown);

    // 3. Generate PDF
    const pdfBuffer = await generatePDF(htmlContent, template.branding as unknown as BrandingSettings);

    // 4. Save to GeneratedDocument
    await prisma.generatedDocument.create({
      data: {
        templateId,
        userId,
        clientId: clientId || null,
        dealId: dealId || null,
        spaceId: spaceId,
        name: `${template.name}_${new Date().toISOString().split('T')[0]}`,
        filePath: "", // In a real app, this would be a URL to S3/Cloudinary
        contextData: context as any,
      }
    });

    // Increment usage count
    await prisma.documentTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${template.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
