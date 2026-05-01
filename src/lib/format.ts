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

const typeEmoji: Record<LeadPayload['type'], string> = {
  quiz: '🧩',
  calculator: '🧮',
  form: '📝',
  consultation: '💬',
};

const channelEmoji: Record<LeadPayload['contact']['channel'], string> = {
  whatsapp: '🟢',
  telegram: '✈️',
  call: '📞',
  max: '💬',
  any: '✅',
};

export function formatLeadText(p: LeadPayload): string {
  const lines: string[] = [];
  const labels = uiText.leadMessage;
  const channelLabel = channelLabels[p.contact.channel] ?? p.contact.channel;

  lines.push(`${labels.newLeadPrefix}`);
  lines.push(`${typeEmoji[p.type]} ${leadTypeLabels[p.type]}`);
  lines.push('');
  lines.push('👤 Контакт');
  if (p.contact.name) lines.push(`• ${labels.name}: ${p.contact.name}`);
  lines.push(`• 📱 ${labels.phone}: ${p.contact.phone}`);
  lines.push(`• ${channelEmoji[p.contact.channel]} ${labels.channel}: ${channelLabel}`);
  if (p.contact.comment) lines.push(`• 💭 ${labels.comment}: ${p.contact.comment}`);

  if (p.type === 'quiz') {
    lines.push('');
    lines.push('🏠 Ответы квиза');
    lines.push(`• ${labels.roomType}: ${roomTypeLabels[p.answers.roomType]}`);
    lines.push(`• ${labels.area}: ${areaLabels[p.answers.area]}`);
    lines.push(`• ${labels.screedType}: ${screedTypeLabels[p.answers.screedType]}`);
    lines.push(`• ${labels.timing}: ${timingLabels[p.answers.timing]}`);
  }

  if (p.type === 'calculator') {
    lines.push('');
    lines.push(`📐 ${labels.paramsTitle}`);
    lines.push(`• ${labels.area}: ${p.params.area} м²`);
    lines.push(`• ${labels.screedType}: ${screedTypeLabels[p.params.type]}`);
    lines.push(`• ${labels.thickness}: ${p.params.thickness} мм`);
    lines.push(`• ${labels.reinforcement}: ${yesNo(p.params.extras.includes('reinforcement'))}`);
    lines.push(`• ${labels.overUnderfloor}: ${yesNo(p.params.extras.includes('overUnderfloor'))}`);
    lines.push(`• ${labels.materialsIncluded}: ${yesNo(p.params.materialsIncluded)}`);
    if (p.params.extras.includes('demolition')) lines.push(`• ${labels.demolition}: Да`);

    if (p.estimatedPrice !== undefined && p.breakdown) {
      lines.push('');
      lines.push(`💰 ${labels.estimate}: ~${fmtRub(p.estimatedPrice)} ₽`);
      lines.push(`• ${labels.work}: ${fmtRub(p.breakdown.work)} ₽`);
      lines.push(`• ${labels.extras}: ${fmtRub(p.breakdown.extras)} ₽`);
      lines.push(`• ${labels.materials}: ${fmtRub(p.breakdown.materials)} ₽`);
    } else {
      lines.push('');
      lines.push(`🧾 ${labels.manualCalculation}`);
    }
  }

  return lines.join('\n');
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `+7***-**-${digits.slice(-2)}`;
}
