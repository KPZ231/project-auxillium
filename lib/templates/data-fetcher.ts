import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export async function getTemplateContextData(clientId?: string, dealId?: string, userId?: string) {
  const context: Record<string, string> = {
    'system.date': format(new Date(), 'd MMMM yyyy', { locale: pl }),
    'system.date_short': format(new Date(), 'dd.MM.yyyy'),
    'system.doc_number': `DOC/${format(new Date(), 'yyyy/MM')}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  };

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      context['user.name'] = user.name || user.username;
      context['user.email'] = user.email;
      context['user.company'] = 'Auxilium CRM User'; // Default or from profile
    }
  }

  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      context['client.name'] = client.name;
      context['client.email'] = client.email || '';
      context['client.address'] = client.location || '';
      context['client.phone'] = client.phone || '';
    }
  }

  if (dealId) {
    const project = await prisma.project.findUnique({ where: { id: dealId } });
    if (project) {
      context['deal.title'] = project.projectName;
      context['deal.value'] = project.budget || '0.00 PLN';
      context['deal.deadline'] = project.dueDate ? format(project.dueDate, 'd MMMM yyyy', { locale: pl }) : 'Brak';
      context['deal.description'] = project.projectDescription;
    }
  }

  return context;
}

export function replaceVariables(content: string, context: Record<string, string>) {
  return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return context[trimmedKey] !== undefined ? context[trimmedKey] : match;
  });
}
