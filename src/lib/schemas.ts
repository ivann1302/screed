import { z } from 'zod';

// Простой regex: +7 затем 10 цифр, разрешаем пробелы, скобки, дефисы между.
// Цель — не идеальная нормализация, а отсев мусора.
const phoneRegex = /^\+7\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

export const contactSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Введите телефон в формате +7 (999) 123-45-67'),
  channel: z.enum(['whatsapp', 'telegram', 'call', 'any']),
  name: z.string().min(1).max(80).optional(),
  comment: z.string().max(500).optional(),
});

export const quizAnswersSchema = z.object({
  roomType: z.enum(['apartment', 'house', 'commercial', 'other']),
  area: z.enum(['lt30', '30-60', '60-100', 'gt100']),
  screedType: z.enum(['semidry', 'wet', 'selfLevel', 'unsure']),
  timing: z.enum(['thisMonth', 'within3m', 'later', 'looking']),
});

export const calcParamsSchema = z.object({
  area: z.number().positive().max(10000),
  type: z.enum(['semidry', 'wet', 'selfLevel']),
  thickness: z.union([z.literal(40), z.literal(60), z.literal(80), z.literal(100)]),
  extras: z.array(z.enum(['reinforcement', 'overUnderfloor', 'demolition'])),
});

export const priceBreakdownSchema = z.object({
  work: z.number().nonnegative(),
  extras: z.number().nonnegative(),
  materials: z.number().nonnegative(),
});

export const leadPayloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('quiz'),         answers: quizAnswersSchema, contact: contactSchema, _hp: z.string().optional() }),
  z.object({ type: z.literal('calculator'),   params: calcParamsSchema, estimatedPrice: z.number().nonnegative(), breakdown: priceBreakdownSchema, contact: contactSchema, _hp: z.string().optional() }),
  z.object({ type: z.literal('form'),         contact: contactSchema, _hp: z.string().optional() }),
  z.object({ type: z.literal('consultation'), contact: contactSchema, _hp: z.string().optional() }),
]);

export type Contact = z.infer<typeof contactSchema>;
export type QuizAnswers = z.infer<typeof quizAnswersSchema>;
export type CalcParams = z.infer<typeof calcParamsSchema>;
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;
export type LeadPayload = z.infer<typeof leadPayloadSchema>;
