import type { LeadPayload } from '@/lib/schemas';

const channelLabel: Record<string, string> = {
  whatsapp: 'WhatsApp', telegram: 'Telegram', call: 'звонок', max: 'MAX', any: 'без разницы',
};
const roomTypeLabel: Record<string, string> = {
  apartment: 'Квартира', house: 'Дом / коттедж', commercial: 'Офис / коммерция', other: 'Другое',
};
const areaLabel: Record<string, string> = {
  lt30: 'до 30 м²', '30-60': '30–60 м²', '60-100': '60–100 м²', gt100: '100+ м²',
};
const screedLabel: Record<string, string> = {
  semidry: 'Полусухая', wet: 'Мокрая', selfLevel: 'Наливной пол', unsure: 'Не знает, нужна консультация',
};
const timingLabel: Record<string, string> = {
  thisMonth: 'В этом месяце', within3m: 'В течение 3 мес.', later: 'Позже', looking: 'Просто смотрит',
};
const extraLabel: Record<string, string> = {
  reinforcement: 'Армирование', overUnderfloor: 'Поверх тёплого пола', demolition: 'Демонтаж старой',
};
const typeLabel: Record<LeadPayload['type'], string> = {
  quiz: 'КВИЗ', calculator: 'КАЛЬКУЛЯТОР', form: 'ФОРМА', consultation: 'КОНСУЛЬТАЦИЯ',
};

const fmtRub = (n: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

export function formatLeadText(p: LeadPayload): string {
  const lines: string[] = [];
  lines.push(`🔔 Новый лид · ${typeLabel[p.type]}`);
  lines.push('');
  if (p.contact.name) lines.push(`Имя: ${p.contact.name}`);
  lines.push(`Телефон: ${p.contact.phone}`);
  lines.push(`Канал: ${channelLabel[p.contact.channel] ?? p.contact.channel}`);
  if (p.contact.comment) lines.push(`Комментарий: ${p.contact.comment}`);

  if (p.type === 'quiz') {
    lines.push('');
    lines.push(`Помещение: ${roomTypeLabel[p.answers.roomType]}`);
    lines.push(`Площадь: ${areaLabel[p.answers.area]}`);
    lines.push(`Тип стяжки: ${screedLabel[p.answers.screedType]}`);
    lines.push(`Сроки: ${timingLabel[p.answers.timing]}`);
  }

  if (p.type === 'calculator') {
    lines.push('');
    lines.push(`Площадь: ${p.params.area} м²`);
    lines.push(`Тип: ${screedLabel[p.params.type]} ${p.params.thickness} мм`);
    if (p.params.extras.length) {
      lines.push(`Дополнительно: ${p.params.extras.map(e => extraLabel[e]).join(', ')}`);
    }
    lines.push('');
    lines.push(`Ориентир: ~${fmtRub(p.estimatedPrice)} ₽`);
    lines.push(`  работа: ${fmtRub(p.breakdown.work)} ₽`);
    lines.push(`  доп: ${fmtRub(p.breakdown.extras)} ₽`);
    lines.push(`  материалы (ориентир): ${fmtRub(p.breakdown.materials)} ₽`);
  }

  return lines.join('\n');
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `+7***-**-${digits.slice(-2)}`;
}
