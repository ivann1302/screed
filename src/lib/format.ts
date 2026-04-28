import type { LeadPayload } from '@/lib/schemas';
import {
  areaLabels,
  channelLabels,
  leadTypeLabels,
  roomTypeLabels,
  screedTypeLabels,
  timingLabels,
  uiText,
} from '@/config/site';

const yesNo = (v: boolean | undefined) =>
  v ? uiText.calculator.summaryLabels.yes : uiText.calculator.summaryLabels.no;

const fmtRub = (n: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

export function formatLeadText(p: LeadPayload): string {
  const lines: string[] = [];
  const labels = uiText.leadMessage;
  lines.push(`${labels.newLeadPrefix} · ${leadTypeLabels[p.type]}`);
  lines.push('');
  if (p.contact.name) lines.push(`${labels.name}: ${p.contact.name}`);
  lines.push(`${labels.phone}: ${p.contact.phone}`);
  lines.push(`${labels.channel}: ${channelLabels[p.contact.channel] ?? p.contact.channel}`);
  if (p.contact.comment) lines.push(`${labels.comment}: ${p.contact.comment}`);

  if (p.type === 'quiz') {
    lines.push('');
    lines.push(`${labels.roomType}: ${roomTypeLabels[p.answers.roomType]}`);
    lines.push(`${labels.area}: ${areaLabels[p.answers.area]}`);
    lines.push(`${labels.screedType}: ${screedTypeLabels[p.answers.screedType]}`);
    lines.push(`${labels.timing}: ${timingLabels[p.answers.timing]}`);
  }

  if (p.type === 'calculator') {
    lines.push('');
    lines.push(labels.paramsTitle);
    lines.push(labels.tableHeader);
    lines.push(labels.tableDivider);
    lines.push(`${labels.area.padEnd(19)}| ${p.params.area} м²`);
    lines.push(`${labels.screedType.padEnd(19)}| ${screedTypeLabels[p.params.type]}`);
    lines.push(`${labels.thickness.padEnd(19)}| ${p.params.thickness} мм`);
    lines.push(`${labels.reinforcement.padEnd(19)}| ${yesNo(p.params.extras.includes('reinforcement'))}`);
    lines.push(`${labels.overUnderfloor.padEnd(19)}| ${yesNo(p.params.extras.includes('overUnderfloor'))}`);
    lines.push(`${labels.materialsIncluded.padEnd(19)}| ${yesNo(p.params.materialsIncluded)}`);
    if (p.params.extras.includes('demolition')) lines.push(`${labels.demolition.padEnd(19)}| Да`);

    if (p.estimatedPrice !== undefined && p.breakdown) {
      lines.push('');
      lines.push(`${labels.estimate}: ~${fmtRub(p.estimatedPrice)} ₽`);
      lines.push(`  ${labels.work}: ${fmtRub(p.breakdown.work)} ₽`);
      lines.push(`  ${labels.extras}: ${fmtRub(p.breakdown.extras)} ₽`);
      lines.push(`  ${labels.materials}: ${fmtRub(p.breakdown.materials)} ₽`);
    } else {
      lines.push('');
      lines.push(labels.manualCalculation);
    }
  }

  return lines.join('\n');
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `+7***-**-${digits.slice(-2)}`;
}
