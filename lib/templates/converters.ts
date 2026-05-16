// lib/templates/converters.ts
import { DocumentBlock } from "@/app/components/templates/TemplateEditor/BlockEditor";

export function blocksToMarkdown(blocks: DocumentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          const level = block.content.level || 1;
          return `${'#'.repeat(level)} ${block.content.text}`;
        case 'text':
          return block.content.text;
        case 'list':
          return (block.content.items || [])
            .map((item: string) => `- ${item}`)
            .join('\n');
        case 'quote':
          return `> ${block.content.text}`;
        case 'table':
          return `| Usługa | Wartość |\n| :--- | :--- |\n| Realizacja projektu | {{deal.value}} |`;
        case 'image':
          return `![Obraz](${block.content.url || ''})`;
        case 'divider':
          return '---';
        case 'variable':
          return `{{${block.content.variable || ''}}}`;
        case 'signature':
          return '\n\n---\nPodpis Wykonawcy | Podpis Zleceniodawcy';
        case 'page-break':
          return '<!-- page-break -->';
        default:
          return '';
      }
    })
    .join('\n\n');
}

export function markdownToBlocks(markdown: string): DocumentBlock[] {
  if (!markdown) return [];

  // Normalize newlines and split by paragraphs (one or more empty lines)
  const paragraphs = markdown.split(/\n\s*\n/);
  const blocks: DocumentBlock[] = [];

  paragraphs.forEach((para, index) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    const id = `block-${Math.random().toString(36).substr(2, 9)}`;

    // Heading (up to 6 levels)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#+)\s+(.*)$/);
      if (match) {
        blocks.push({
          id,
          type: 'heading',
          content: { text: match[2], level: match[1].length }
        });
        return;
      }
    }

    // List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').map(l => l.replace(/^([-*]|\d+\.)\s+/, ''));
      blocks.push({
        id,
        type: 'list',
        content: { items }
      });
      return;
    }

    // Quote
    if (trimmed.startsWith('> ')) {
      blocks.push({
        id,
        type: 'quote',
        content: { text: trimmed.replace(/^>\s+/, '') }
      });
      return;
    }

    // Image
    if (trimmed.startsWith('![') && trimmed.includes('](')) {
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        blocks.push({
          id,
          type: 'image',
          content: { url: match[2], width: 100 }
        });
        return;
      }
    }

    // Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({
        id,
        type: 'divider',
        content: {}
      });
      return;
    }

    // Variable (Single variable in a paragraph)
    if (trimmed.startsWith('{{') && trimmed.endsWith('}}') && !trimmed.includes('\n')) {
      blocks.push({
        id,
        type: 'variable',
        content: { variable: trimmed.replace(/[{}]/g, '') }
      });
      return;
    }

    // Default to text
    blocks.push({
      id,
      type: 'text',
      content: { text: trimmed }
    });
  });

  return blocks;
}
