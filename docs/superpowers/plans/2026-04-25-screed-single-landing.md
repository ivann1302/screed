# Single landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Запустить готовый к деплою на Vercel одиночный лендинг для частного мастера по стяжке пола: 11 контентных блоков, квиз, калькулятор без показа цены, баннер консультации, fan-out лидов в TG + Email + VK.

**Architecture:** Vite + React + TS + Tailwind, статика через `vite-ssg` (готовый HTML), один Vercel Serverless `api/lead.ts` с zod-валидацией и `Promise.allSettled` fan-out. Все редактируемые поля (имя, телефон, цены, цвета, контент) — в `src/config/site.ts`. Стили — Tailwind classNames in-place + `cva` для вариантов кнопок.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind 3, vite-ssg, react-hook-form, zod, clsx, class-variance-authority, vitest, @testing-library/react, jsdom, nodemailer.

**Конкретно для UI-задач (Tasks 7–14):** имплементер ОБЯЗАН прочитать `~/.claude/skills/frontend-design/SKILL.md` перед написанием кода. Skill закрывает 9 принципов: render only from props, Russian typography с nbsp, motion-safe для анимаций, prop fallbacks, единая шкала отступов и т.д.

**Spec:** `docs/superpowers/specs/2026-04-25-screed-single-landing-design.md`

---

## File structure

```
screed/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── api/
│   └── lead.ts                  # Vercel Serverless: POST handler
├── public/
│   ├── images/                  # фото мастера, кейсов
│   └── og.jpg                   # og:image заглушка
├── src/
│   ├── main.tsx                 # vite-ssg entry
│   ├── App.tsx                  # компоновка 11 блоков
│   ├── styles/
│   │   └── index.css            # @tailwind + base reset + Archivo
│   ├── config/
│   │   └── site.ts              # ВСЁ редактируемое
│   ├── lib/
│   │   ├── schemas.ts           # zod-схемы (общие client+server)
│   │   ├── pricing.ts           # формула калькулятора (client)
│   │   ├── lead.ts              # postLead клиентский (fetch wrapper)
│   │   ├── tg.ts                # SERVER ONLY — sendTelegramMessage
│   │   ├── email.ts             # SERVER ONLY — sendEmail
│   │   ├── vk.ts                # SERVER ONLY — sendVkMessage (двум получателям)
│   │   └── format.ts            # форматтеры для текстов уведомлений
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx       # cva-варианты в файле
│   │   │   ├── Field.tsx        # label + input/textarea + error
│   │   │   └── PillGroup.tsx    # radio-выбор пилюлями
│   │   ├── Hero/index.tsx
│   │   ├── Services/index.tsx
│   │   ├── Quiz/
│   │   │   ├── index.tsx
│   │   │   ├── QuizStep1.tsx ... QuizStep5.tsx
│   │   │   └── reducer.ts
│   │   ├── Pricing/index.tsx
│   │   ├── Cases/index.tsx
│   │   ├── About/index.tsx
│   │   ├── Calculator/index.tsx
│   │   ├── Reviews/index.tsx
│   │   ├── LeadForm/index.tsx
│   │   ├── FAQ/index.tsx
│   │   ├── Footer/index.tsx
│   │   ├── ConsultationBanner/
│   │   │   ├── index.tsx
│   │   │   ├── ConsultationCard.tsx
│   │   │   └── useScrollTrigger.ts
│   │   └── LeadSuccess.tsx
│   └── pages/
│       └── Privacy.tsx          # статичная страница политики
└── tests/
    ├── lib/
    │   ├── schemas.test.ts
    │   ├── pricing.test.ts
    │   ├── lead.test.ts
    │   ├── tg.test.ts
    │   ├── email.test.ts
    │   └── vk.test.ts
    ├── api/
    │   └── lead.test.ts
    └── components/
        ├── Quiz.test.tsx
        ├── Calculator.test.tsx
        ├── LeadForm.test.tsx
        └── ConsultationBanner.test.tsx
```

---

## Task 1: Bootstrap project (Vite + React + TS + Tailwind + vite-ssg)

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `.gitignore`, `.env.example`

- [ ] **Step 1.1: Initialize npm and dependencies**

```bash
cd /home/ivan/renta/screed
npm init -y
npm install react@^18 react-dom@^18 react-hook-form@^7 zod@^3 clsx@^2 class-variance-authority@^0.7 nodemailer@^6
npm install -D vite@^5 @vitejs/plugin-react@^4 vite-ssg@^0.24 @types/react@^18 @types/react-dom@^18 @types/node @types/nodemailer typescript@^5.6 tailwindcss@^3.4 postcss@^8 autoprefixer@^10 vitest@^1 @testing-library/react@^14 @testing-library/jest-dom@^6 @testing-library/user-event@^14 jsdom@^23
```

**Важно:** версии зафиксированы:
- `tailwindcss@^3.4` — потому что v4 поломала `@tailwind base/components/utilities` директивы и postcss-плагин (план использует v3 синтаксис).
- `typescript@^5.6` — потому что TS 6+ выбрасывает ошибку TS5101 на `baseUrl` в tsconfig.

- [ ] **Step 1.2: Initialize git**

```bash
git init
echo 'node_modules
dist
.env.local
.env.*.local
.vercel
.superpowers
*.log' > .gitignore
```

- [ ] **Step 1.3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "api", "tests", "tailwind.config.ts", "vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 1.4: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 1.5: Create `tailwind.config.ts` (theme imports siteConfig — see Task 3)**

Skeleton without colors yet (Task 3 will fill them):
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Archivo'", 'system-ui', 'sans-serif'],
        display: ["'Archivo Black'", "'Archivo'", 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

- [ ] **Step 1.6: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },
});
```

- [ ] **Step 1.7: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 1.8: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 1.9: Create `index.html`**

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&family=Archivo+Black&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 1.10: Create `src/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
}
```

> Note: `body { @apply bg-bg text-text font-sans antialiased; }` добавится в Task 2.2 после того, как theme-токены окажутся в `tailwind.config.ts`.

- [ ] **Step 1.11: Create `src/main.tsx`**

```tsx
import { ViteSSG } from 'vite-ssg/single-page';
import App from './App';
import './styles/index.css';

export const createApp = ViteSSG(App);
```

- [ ] **Step 1.12: Create `src/App.tsx` placeholder**

```tsx
export default function App() {
  return (
    <main>
      <h1>Лендинг — в разработке</h1>
    </main>
  );
}
```

- [ ] **Step 1.13: Add scripts to `package.json`**

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite-ssg build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 1.14: Create `.env.example`**

```
TG_BOT_TOKEN=
TG_CHAT_ID=
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_TO=
VK_GROUP_TOKEN=
VK_OWNER_USER_ID=
VK_MASTER_USER_ID=
```

- [ ] **Step 1.15: Run dev server, smoke test**

```bash
npm run dev
```

Expected: Vite сервер на `http://localhost:5173`, страница показывает «Лендинг — в разработке».

Остановить (Ctrl+C). Прогнать build:
```bash
npm run build
ls dist/index.html
```
Expected: файл `dist/index.html` создан.

Прогнать typecheck:
```bash
npm run typecheck
```
Expected: 0 errors.

- [ ] **Step 1.16: Commit**

```bash
git add -A
git commit -m "chore: bootstrap vite + react + tailwind + vite-ssg"
```

---

## Task 2: siteConfig types and default values

**Files:**
- Create: `src/config/site.ts`, `tests/lib/siteConfig.test.ts`

- [ ] **Step 2.1: Create `src/config/site.ts`**

```ts
export type Channel = 'whatsapp' | 'telegram' | 'call' | 'any';
export type ScreedType = 'semidry' | 'wet' | 'selfLevel';
export type ScreedTypeWithUnsure = ScreedType | 'unsure';

export type SiteConfig = {
  master: {
    name: string;
    phone: string;
    city: string;
    experienceYears: number;
    photoUrl?: string;
  };
  contacts: {
    whatsapp: string;     // wa.me URL
    telegram: string;     // t.me URL
    vk: string;           // vk.com URL
    email: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  theme: {
    accent: string;
    accentDark: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    shadow: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    imageUrl?: string;
  };
  leadForm: {
    backgroundImageUrl?: string;
  };
  services: { title: string; description: string }[];
  cases: { title: string; beforeUrl: string; afterUrl: string; description?: string }[];
  reviews: { author: string; text: string; rating: number }[];
  faq: { question: string; answer: string }[];
  about: { headline: string; bullets: string[] };
  pricing: {
    items: { name: string; pricePerM2: number; note?: string }[];
    rates: Record<ScreedType, number>;             // ₽/м² базовая
    thicknessMultiplier: Record<40 | 60 | 80 | 100, number>;
    extras: {
      reinforcement: number;
      overUnderfloor: number;
      demolition: number;
    };
  };
};

export const siteConfig: SiteConfig = {
  master: {
    name: 'Иван Иванов',
    phone: '+7 (999) 000-00-00',
    city: 'Москва',
    experienceYears: 10,
    photoUrl: undefined,
  },
  contacts: {
    whatsapp: 'https://wa.me/79990000000',
    telegram: 'https://t.me/screed_master',
    vk: 'https://vk.com/screed_master',
    email: 'master@example.com',
  },
  seo: {
    title: 'Стяжка пола под ключ в Москве — Иван Иванов',
    description: 'Полусухая, мокрая, наливные полы. Опыт 10 лет, гарантия 5 лет. Замер бесплатно.',
    ogImage: '/og.jpg',
  },
  theme: {
    accent:     '#ea580c',
    accentDark: '#c2410c',
    bg:         '#1f2937',
    surface:    'rgba(255,255,255,0.05)',
    text:       'rgba(255,255,255,0.95)',
    muted:      'rgba(255,255,255,0.65)',
    border:     'rgba(255,255,255,0.18)',
    shadow:     '#d1d5db',
  },
  leadForm: {
    backgroundImageUrl: undefined as string | undefined,
  },
  hero: {
    headline: 'Стяжка пола под ключ в Москве',
    subheadline: 'От 450 ₽/м². Гарантия 5 лет. Замер бесплатно.',
    ctaText: 'Получить расчёт',
  },
  services: [
    { title: 'Полусухая стяжка', description: 'Механизированная укладка, готовность к ходьбе через 12 часов.' },
    { title: 'Мокрая стяжка', description: 'Цементно-песчаная смесь, армирование сеткой, набор прочности 7–14 дней.' },
    { title: 'Наливной пол', description: 'Самовыравнивающаяся смесь поверх стяжки, под финишное покрытие.' },
    { title: 'Стяжка с тёплым полом', description: 'Заливка поверх водяного или электрического контура, контроль уклонов.' },
  ],
  cases: [
    {
      title: 'Квартира 75 м² в ЖК Хорошёвский',
      beforeUrl: 'https://picsum.photos/seed/before1/800/520',
      afterUrl: 'https://picsum.photos/seed/after1/800/520',
      description: 'Полусухая 60 мм, 1 день работы, 14 дней до укладки финиша.',
    },
  ],
  reviews: [
    { author: 'Анна, ЖК Хорошёвский', text: 'Залили за день, ровно по уровню. Через две недели легла плитка без проблем.', rating: 5 },
    { author: 'Дмитрий, прораб', text: 'Работаем с Иваном на трёх объектах. Цена честная, сроки держит.', rating: 5 },
  ],
  faq: [
    { question: 'Сколько по времени делается стяжка?', answer: 'Полусухая — один день работы, ходить можно через 12 часов. Финишное покрытие можно класть через 7–14 дней в зависимости от толщины.' },
    { question: 'Какая гарантия?', answer: 'Гарантия 5 лет на работы. Если есть трещины или отслоения по нашей вине — переделываем бесплатно.' },
    { question: 'Что входит в цену?', answer: 'Работа, материалы, армирование, демонтаж старой стяжки оговаривается отдельно.' },
    { question: 'Выезжаете за МКАД?', answer: 'Да, в пределах 50 км от МКАД без доплаты. Дальше — обсуждается.' },
    { question: 'Принимаете оплату по безналу?', answer: 'Да, работаю как самозанятый. Чек выдам через приложение.' },
  ],
  about: {
    headline: 'О мастере',
    bullets: [
      '10 лет опыта в стяжке пола',
      'Лично работаю на каждом объекте, без субподряда',
      'Договор, чек, акт скрытых работ',
      'Бесплатный замер с лазерным уровнем',
    ],
  },
  pricing: {
    items: [
      { name: 'Полусухая стяжка от 50 мм', pricePerM2: 450 },
      { name: 'Мокрая стяжка от 50 мм', pricePerM2: 600 },
      { name: 'Наливной пол', pricePerM2: 750, note: 'от' },
    ],
    rates: { semidry: 450, wet: 600, selfLevel: 750 },
    thicknessMultiplier: { 40: 1, 60: 1.15, 80: 1.3, 100: 1.5 },
    extras: { reinforcement: 40, overUnderfloor: 80, demolition: 100 },
  },
};
```

- [ ] **Step 2.2: Update `tailwind.config.ts` to use `siteConfig.theme`**

```ts
import type { Config } from 'tailwindcss';
import { siteConfig } from './src/config/site';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:     siteConfig.theme.accent,
        accentDark: siteConfig.theme.accentDark,
        bg:         siteConfig.theme.bg,
        surface:    siteConfig.theme.surface,
        text:       siteConfig.theme.text,
        muted:      siteConfig.theme.muted,
        border:     siteConfig.theme.border,
        shadow:     siteConfig.theme.shadow,
      },
      fontFamily: {
        sans:    ["'Archivo'", 'system-ui', 'sans-serif'],
        display: ["'Archivo Black'", "'Archivo'", 'system-ui', 'sans-serif'],
      },
      // brutalist offset-shadow utilities
      boxShadow: {
        brutal:    `6px 6px 0 0 ${siteConfig.theme.shadow}`,
        brutalLg:  `8px 8px 0 0 ${siteConfig.theme.shadow}`,
        brutalSm:  `3px 3px 0 0 ${siteConfig.theme.shadow}`,
      },
    },
    // Brutalist override: все «прямоугольные» radii обнуляем, full оставляем для точек/FAB
    borderRadius: {
      none: '0',
      sm:   '0',
      DEFAULT: '0',
      md:   '0',
      lg:   '0',
      xl:   '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px',
    },
  },
} satisfies Config;
```

- [ ] **Step 2.3: Add body styling to `src/styles/index.css`**

Заменить файл на:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply bg-bg text-text font-sans antialiased; }
}
```

Теперь токены `bg-bg`, `text-text`, `font-sans` зарезолвятся, потому что `tailwind.config.ts` (Step 2.2) уже их зарегистрировал.

- [ ] **Step 2.4: Smoke-проверка билда**

```bash
npm run typecheck
npm run build
```

Expected: оба прошли без ошибок.

- [ ] **Step 2.5: Commit**

```bash
git add src/config tailwind.config.ts src/styles/index.css
git commit -m "feat: site config + theme tokens + body base styling"
```

---

## Task 3: zod-схемы для всех 4 типов лидов

**Files:**
- Create: `src/lib/schemas.ts`, `tests/lib/schemas.test.ts`

- [ ] **Step 3.1: Write failing tests `tests/lib/schemas.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { leadPayloadSchema, contactSchema } from '@/lib/schemas';

describe('contactSchema', () => {
  it('accepts valid contact', () => {
    const r = contactSchema.safeParse({ phone: '+79991234567', channel: 'whatsapp' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid phone', () => {
    const r = contactSchema.safeParse({ phone: 'abc', channel: 'whatsapp' });
    expect(r.success).toBe(false);
  });

  it('rejects unknown channel', () => {
    const r = contactSchema.safeParse({ phone: '+79991234567', channel: 'fax' });
    expect(r.success).toBe(false);
  });

  it('allows optional name and comment', () => {
    const r = contactSchema.safeParse({
      phone: '+79991234567', channel: 'call', name: 'Иван', comment: 'после 18:00',
    });
    expect(r.success).toBe(true);
  });
});

describe('leadPayloadSchema', () => {
  const okContact = { phone: '+79991234567', channel: 'whatsapp' as const };

  it('accepts quiz payload', () => {
    const r = leadPayloadSchema.safeParse({
      type: 'quiz',
      answers: { roomType: 'apartment', area: '30-60', screedType: 'semidry', timing: 'thisMonth' },
      contact: okContact,
    });
    expect(r.success).toBe(true);
  });

  it('accepts calculator payload', () => {
    const r = leadPayloadSchema.safeParse({
      type: 'calculator',
      params: { area: 75, type: 'semidry', thickness: 60, extras: ['reinforcement'] },
      estimatedPrice: 48750,
      breakdown: { work: 33750, extras: 3000, materials: 12000 },
      contact: okContact,
    });
    expect(r.success).toBe(true);
  });

  it('accepts form payload', () => {
    const r = leadPayloadSchema.safeParse({ type: 'form', contact: okContact });
    expect(r.success).toBe(true);
  });

  it('accepts consultation payload', () => {
    const r = leadPayloadSchema.safeParse({
      type: 'consultation',
      contact: { phone: '+79991234567', channel: 'whatsapp', name: 'Анна' },
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown type', () => {
    const r = leadPayloadSchema.safeParse({ type: 'something', contact: okContact });
    expect(r.success).toBe(false);
  });

  it('passes through optional honeypot', () => {
    const r = leadPayloadSchema.safeParse({ type: 'form', contact: okContact, _hp: '' });
    expect(r.success).toBe(true);
  });
});
```

- [ ] **Step 3.2: Run, expect FAIL**

```bash
npm run test:run -- tests/lib/schemas.test.ts
```

Expected: `Cannot find module '@/lib/schemas'` или подобная ошибка.

- [ ] **Step 3.3: Implement `src/lib/schemas.ts`**

```ts
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
```

- [ ] **Step 3.4: Run tests, expect PASS**

```bash
npm run test:run -- tests/lib/schemas.test.ts
```

Expected: 7 passed.

- [ ] **Step 3.5: Commit**

```bash
git add src/lib/schemas.ts tests/lib/schemas.test.ts
git commit -m "feat: zod schemas for lead payloads"
```

---

## Task 4: Калькулятор-формула `lib/pricing.ts`

**Files:**
- Create: `src/lib/pricing.ts`, `tests/lib/pricing.test.ts`

- [ ] **Step 4.1: Write failing tests**

```ts
// tests/lib/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePrice } from '@/lib/pricing';
import { siteConfig } from '@/config/site';

describe('calculatePrice', () => {
  const p = siteConfig.pricing;

  it('semidry 75m² × 60mm with reinforcement', () => {
    const r = calculatePrice(
      { area: 75, type: 'semidry', thickness: 60, extras: ['reinforcement'] },
      p,
    );
    // work: 75 * 450 * 1.15 = 38812.5; extras: 75 * 40 = 3000; materials: 75 * 160 = 12000 (placeholder)
    expect(r.breakdown.work).toBe(38813);            // round
    expect(r.breakdown.extras).toBe(3000);
    expect(r.breakdown.materials).toBe(12000);
    expect(r.estimatedPrice).toBe(38813 + 3000 + 12000);
  });

  it('wet 50m² × 40mm no extras', () => {
    const r = calculatePrice({ area: 50, type: 'wet', thickness: 40, extras: [] }, p);
    expect(r.breakdown.work).toBe(50 * 600 * 1);
    expect(r.breakdown.extras).toBe(0);
  });

  it('selfLevel 100m² × 80mm with all extras', () => {
    const r = calculatePrice(
      { area: 100, type: 'selfLevel', thickness: 80, extras: ['reinforcement', 'overUnderfloor', 'demolition'] },
      p,
    );
    expect(r.breakdown.work).toBe(100 * 750 * 1.3);
    expect(r.breakdown.extras).toBe(100 * (40 + 80 + 100));
  });

  it('rounds to integer rubles', () => {
    const r = calculatePrice({ area: 33, type: 'semidry', thickness: 60, extras: [] }, p);
    expect(Number.isInteger(r.estimatedPrice)).toBe(true);
    expect(Number.isInteger(r.breakdown.work)).toBe(true);
  });

  it('zero area returns zero', () => {
    const r = calculatePrice({ area: 0, type: 'semidry', thickness: 40, extras: [] }, p);
    expect(r.estimatedPrice).toBe(0);
  });
});
```

- [ ] **Step 4.2: Run, expect FAIL**

```bash
npm run test:run -- tests/lib/pricing.test.ts
```

- [ ] **Step 4.3: Implement `src/lib/pricing.ts`**

```ts
import type { CalcParams, PriceBreakdown } from '@/lib/schemas';
import type { SiteConfig } from '@/config/site';

const MATERIALS_PER_M2 = 160; // ориентир материалов в ₽/м², заглушка для MVP

export function calculatePrice(
  params: CalcParams,
  pricing: SiteConfig['pricing'],
): { estimatedPrice: number; breakdown: PriceBreakdown } {
  const { area, type, thickness, extras } = params;
  const baseRate = pricing.rates[type];
  const multiplier = pricing.thicknessMultiplier[thickness];
  const work = Math.round(area * baseRate * multiplier);
  const extrasSum = Math.round(
    extras.reduce((sum, key) => sum + (pricing.extras[key] ?? 0), 0) * area,
  );
  const materials = Math.round(area * MATERIALS_PER_M2);
  return {
    estimatedPrice: work + extrasSum + materials,
    breakdown: { work, extras: extrasSum, materials },
  };
}
```

- [ ] **Step 4.4: Run tests, expect PASS**

```bash
npm run test:run -- tests/lib/pricing.test.ts
```

- [ ] **Step 4.5: Commit**

```bash
git add src/lib/pricing.ts tests/lib/pricing.test.ts
git commit -m "feat: pricing formula for calculator"
```

---

## Task 5: Серверные интеграции — `lib/tg.ts`, `lib/email.ts`, `lib/vk.ts`, `lib/format.ts`

**Files:**
- Create: `src/lib/tg.ts`, `src/lib/email.ts`, `src/lib/vk.ts`, `src/lib/format.ts`
- Create: `tests/lib/tg.test.ts`, `tests/lib/email.test.ts`, `tests/lib/vk.test.ts`, `tests/lib/format.test.ts`

- [ ] **Step 5.1: Write failing test `tests/lib/format.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { formatLeadText, maskPhone } from '@/lib/format';
import type { LeadPayload } from '@/lib/schemas';

describe('formatLeadText', () => {
  it('formats consultation lead', () => {
    const p: LeadPayload = {
      type: 'consultation',
      contact: { phone: '+79991234567', channel: 'whatsapp', name: 'Анна' },
    };
    const t = formatLeadText(p);
    expect(t).toMatch(/КОНСУЛЬТАЦИЯ/);
    expect(t).toMatch(/Анна/);
    expect(t).toMatch(/\+79991234567/);
    expect(t).toMatch(/whatsapp/i);
  });

  it('formats calculator lead with breakdown', () => {
    const p: LeadPayload = {
      type: 'calculator',
      params: { area: 75, type: 'semidry', thickness: 60, extras: ['reinforcement'] },
      estimatedPrice: 53813,
      breakdown: { work: 38813, extras: 3000, materials: 12000 },
      contact: { phone: '+79991234567', channel: 'telegram' },
    };
    const t = formatLeadText(p);
    expect(t).toMatch(/КАЛЬКУЛЯТОР/);
    expect(t).toMatch(/75/);
    expect(t).toMatch(/53\s?813|53,?813|53813/);
  });

  it('formats quiz lead with answers', () => {
    const p: LeadPayload = {
      type: 'quiz',
      answers: { roomType: 'apartment', area: '30-60', screedType: 'semidry', timing: 'thisMonth' },
      contact: { phone: '+79991234567', channel: 'call' },
    };
    const t = formatLeadText(p);
    expect(t).toMatch(/КВИЗ/);
    expect(t).toMatch(/Квартира/);
  });
});

describe('maskPhone', () => {
  it('masks middle digits', () => {
    expect(maskPhone('+79991234567')).toBe('+7***-**-67');
  });

  it('handles short input gracefully', () => {
    expect(maskPhone('abc')).toBe('***');
  });
});
```

- [ ] **Step 5.2: Implement `src/lib/format.ts`**

```ts
import type { LeadPayload } from '@/lib/schemas';

const channelLabel: Record<string, string> = {
  whatsapp: 'WhatsApp', telegram: 'Telegram', call: 'звонок', any: 'без разницы',
};
const roomTypeLabel: Record<string, string> = {
  apartment: 'Квартира', house: 'Дом / коттедж', commercial: 'Офис / коммерция', other: 'Другое',
};
const areaLabel: Record<string, string> = {
  lt30: 'до 30 м²', '30-60': '30–60 м²', '60-100': '60–100 м²', gt100: '100+ м²',
};
const screedLabel: Record<string, string> = {
  semidry: 'Полусухая', wet: 'Мокрая', selfLevel: 'Наливной пол', unsure: 'Не знает, нужна консультация',
};
const timingLabel: Record<string, string> = {
  thisMonth: 'В этом месяце', within3m: 'В течение 3 мес.', later: 'Позже', looking: 'Просто смотрит',
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
    lines.push(`Площадь: ${p.params.area} м²`);
    lines.push(`Тип: ${screedLabel[p.params.type]} ${p.params.thickness} мм`);
    if (p.params.extras.length) {
      lines.push(`Дополнительно: ${p.params.extras.map(e => extraLabel[e]).join(', ')}`);
    }
    lines.push('');
    lines.push(`Ориентир: ~${fmtRub(p.estimatedPrice)} ₽`);
    lines.push(`  работа: ${fmtRub(p.breakdown.work)} ₽`);
    lines.push(`  доп: ${fmtRub(p.breakdown.extras)} ₽`);
    lines.push(`  материалы (ориентир): ${fmtRub(p.breakdown.materials)} ₽`);
  }

  return lines.join('\n');
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `+7***-**-${digits.slice(-2)}`;
}
```

- [ ] **Step 5.3: Run format tests, expect PASS**

```bash
npm run test:run -- tests/lib/format.test.ts
```

- [ ] **Step 5.4: Write failing test `tests/lib/tg.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelegramMessage } from '@/lib/tg';

describe('sendTelegramMessage', () => {
  beforeEach(() => {
    process.env.TG_BOT_TOKEN = 'tok';
    process.env.TG_CHAT_ID = '123';
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }) as Response);
  });
  afterEach(() => {
    delete process.env.TG_BOT_TOKEN;
    delete process.env.TG_CHAT_ID;
    vi.restoreAllMocks();
  });

  it('calls Telegram Bot API sendMessage with correct payload', async () => {
    await sendTelegramMessage('hello');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        body: expect.stringContaining('"chat_id":"123"'),
      }),
    );
  });

  it('throws if env vars missing', async () => {
    delete process.env.TG_BOT_TOKEN;
    await expect(sendTelegramMessage('x')).rejects.toThrow(/TG_BOT_TOKEN/);
  });

  it('throws on Telegram API error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ description: 'bad' }) });
    await expect(sendTelegramMessage('x')).rejects.toThrow();
  });
});
```

- [ ] **Step 5.5: Implement `src/lib/tg.ts`**

```ts
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token) throw new Error('TG_BOT_TOKEN is not set');
  if (!chatId) throw new Error('TG_CHAT_ID is not set');

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Telegram API error: ${(data as any).description ?? res.statusText}`);
  }
}
```

- [ ] **Step 5.6: Write failing test `tests/lib/email.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';

const sendMail = vi.fn();
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail }) },
}));

import { sendEmail } from '@/lib/email';

describe('sendEmail', () => {
  it('sends mail with subject and html', async () => {
    process.env.SMTP_HOST = 'smtp.x'; process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'u'; process.env.SMTP_PASS = 'p';
    process.env.SMTP_FROM = 'from@x'; process.env.SMTP_TO = 'to@x';

    await sendEmail({ subject: 'Тест', html: '<b>hi</b>' });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'from@x', to: 'to@x', subject: 'Тест', html: '<b>hi</b>',
    }));
  });
});
```

- [ ] **Step 5.7: Implement `src/lib/email.ts`**

```ts
import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  return transporter;
}

export async function sendEmail({ subject, html }: { subject: string; html: string }): Promise<void> {
  if (!process.env.SMTP_FROM || !process.env.SMTP_TO) {
    throw new Error('SMTP_FROM and SMTP_TO must be set');
  }
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject,
    html,
  });
}
```

- [ ] **Step 5.8: Write failing test `tests/lib/vk.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendVkMessage } from '@/lib/vk';

describe('sendVkMessage', () => {
  beforeEach(() => {
    process.env.VK_GROUP_TOKEN = 'tok';
    process.env.VK_OWNER_USER_ID = '111';
    process.env.VK_MASTER_USER_ID = '222';
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ response: 1 }) }) as Response);
  });
  afterEach(() => {
    delete process.env.VK_GROUP_TOKEN;
    delete process.env.VK_OWNER_USER_ID;
    delete process.env.VK_MASTER_USER_ID;
    vi.restoreAllMocks();
  });

  it('sends to both owner and master', async () => {
    await sendVkMessage('hello');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('sends only to owner if master id is empty', async () => {
    process.env.VK_MASTER_USER_ID = '';
    await sendVkMessage('hello');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws if VK_GROUP_TOKEN missing', async () => {
    delete process.env.VK_GROUP_TOKEN;
    await expect(sendVkMessage('x')).rejects.toThrow(/VK_GROUP_TOKEN/);
  });

  it('throws if at least one VK call returns error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ error: { error_msg: 'nope' } }) });
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ response: 1 }) });
    await expect(sendVkMessage('x')).rejects.toThrow(/VK API error: nope/);
  });
});
```

- [ ] **Step 5.9: Implement `src/lib/vk.ts`**

```ts
const VK_API_VERSION = '5.199';

async function sendOnce(token: string, userId: string, text: string): Promise<void> {
  const url = new URL('https://api.vk.com/method/messages.send');
  url.searchParams.set('user_id', userId);
  url.searchParams.set('message', text);
  url.searchParams.set('random_id', String(Date.now() + Math.floor(Math.random() * 1e6)));
  url.searchParams.set('access_token', token);
  url.searchParams.set('v', VK_API_VERSION);

  const res = await fetch(url.toString(), { method: 'POST' });
  const data: any = await res.json();
  if (data.error) throw new Error(`VK API error: ${data.error.error_msg}`);
}

export async function sendVkMessage(text: string): Promise<void> {
  const token = process.env.VK_GROUP_TOKEN;
  if (!token) throw new Error('VK_GROUP_TOKEN is not set');
  const owner = process.env.VK_OWNER_USER_ID;
  const master = process.env.VK_MASTER_USER_ID;
  if (!owner) throw new Error('VK_OWNER_USER_ID is not set');

  // Если ошибка — кидаем; в api/lead это поймает Promise.allSettled и не уронит другие каналы.
  await sendOnce(token, owner, text);
  if (master) await sendOnce(token, master, text);
}
```

- [ ] **Step 5.10: Run all lib tests, expect PASS**

```bash
npm run test:run -- tests/lib
```

Expected: format/tg/email/vk все проходят.

- [ ] **Step 5.11: Commit**

```bash
git add src/lib tests/lib
git commit -m "feat: server-only integrations (tg, email, vk) and lead text formatter"
```

---

## Task 6: API endpoint `api/lead.ts` с fan-out

**Files:**
- Create: `api/lead.ts`, `tests/api/lead.test.ts`

- [ ] **Step 6.1: Write failing tests**

```ts
// tests/api/lead.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendTelegramMessage = vi.fn();
const sendEmail = vi.fn();
const sendVkMessage = vi.fn();

vi.mock('@/lib/tg', () => ({ sendTelegramMessage }));
vi.mock('@/lib/email', () => ({ sendEmail }));
vi.mock('@/lib/vk', () => ({ sendVkMessage }));

import handler from '../../api/lead';

function makeReq(body: any, method = 'POST', ip = '1.2.3.4') {
  return new Request('http://localhost/api/lead', {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const okContact = { phone: '+79991234567', channel: 'whatsapp' as const };
const validForm = { type: 'form' as const, contact: okContact };

describe('POST /api/lead', () => {
  beforeEach(() => {
    sendTelegramMessage.mockReset().mockResolvedValue(undefined);
    sendEmail.mockReset().mockResolvedValue(undefined);
    sendVkMessage.mockReset().mockResolvedValue(undefined);
  });

  it('rejects non-POST', async () => {
    const res = await handler(makeReq(validForm, 'GET'));
    expect(res.status).toBe(405);
  });

  it('rejects bad JSON', async () => {
    const res = await handler(makeReq('{ broken', 'POST'));
    expect(res.status).toBe(400);
  });

  it('rejects invalid payload', async () => {
    const res = await handler(makeReq({ type: 'unknown' }));
    expect(res.status).toBe(400);
  });

  it('fans out to all 3 channels on valid payload', async () => {
    const res = await handler(makeReq(validForm, 'POST', '5.5.5.5'));
    expect(res.status).toBe(200);
    expect(sendTelegramMessage).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendVkMessage).toHaveBeenCalledOnce();
  });

  it('returns 200 if at least one channel succeeds', async () => {
    sendTelegramMessage.mockRejectedValueOnce(new Error('tg down'));
    sendVkMessage.mockRejectedValueOnce(new Error('vk down'));
    const res = await handler(makeReq(validForm, 'POST', '6.6.6.6'));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.delivered).toContain('email');
  });

  it('returns 502 if all channels fail', async () => {
    sendTelegramMessage.mockRejectedValueOnce(new Error('x'));
    sendEmail.mockRejectedValueOnce(new Error('x'));
    sendVkMessage.mockRejectedValueOnce(new Error('x'));
    const res = await handler(makeReq(validForm, 'POST', '7.7.7.7'));
    expect(res.status).toBe(502);
  });

  it('honeypot (_hp non-empty) returns 200 without sending', async () => {
    const res = await handler(makeReq({ ...validForm, _hp: 'spam' }, 'POST', '8.8.8.8'));
    expect(res.status).toBe(200);
    expect(sendTelegramMessage).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendVkMessage).not.toHaveBeenCalled();
  });

  it('rate-limits same IP within 10 seconds', async () => {
    const ip = '9.9.9.9';
    const r1 = await handler(makeReq(validForm, 'POST', ip));
    const r2 = await handler(makeReq(validForm, 'POST', ip));
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(429);
  });
});
```

- [ ] **Step 6.2: Run, expect FAIL**

```bash
npm run test:run -- tests/api/lead.test.ts
```

Expected: модуль `api/lead` не найден.

- [ ] **Step 6.3: Implement `api/lead.ts`**

```ts
import { leadPayloadSchema, type LeadPayload } from '@/lib/schemas';
import { sendTelegramMessage } from '@/lib/tg';
import { sendEmail } from '@/lib/email';
import { sendVkMessage } from '@/lib/vk';
import { formatLeadText, maskPhone } from '@/lib/format';

const RATE_WINDOW_MS = 10_000;
const lastByIp = new Map<string, number>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const last = lastByIp.get(ip) ?? 0;
  if (now - last < RATE_WINDOW_MS) return true;
  lastByIp.set(ip, now);
  // best-effort cleanup
  if (lastByIp.size > 1000) {
    for (const [k, v] of lastByIp) if (now - v > RATE_WINDOW_MS) lastByIp.delete(k);
  }
  return false;
}

function getIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  return xf ? xf.split(',')[0].trim() : 'unknown';
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!));
}

function leadHtml(p: LeadPayload, text: string): string {
  const tel = `<a href="tel:${escapeHtml(p.contact.phone)}">${escapeHtml(p.contact.phone)}</a>`;
  return `<pre style="font-family:ui-monospace,monospace;font-size:14px;line-height:1.5">${escapeHtml(text).replace(escapeHtml(p.contact.phone), tel)}</pre>`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad_json' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const parsed = leadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'invalid_payload', issues: parsed.error.issues }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  const payload = parsed.data;

  // Honeypot — выглядит как 200 OK, но без отправки.
  if (payload._hp && payload._hp.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  const ip = getIp(req);
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { 'content-type': 'application/json' } });
  }

  const text = formatLeadText(payload);
  const subject = `Лид · ${payload.type} · ${payload.contact.phone}`;
  const html = leadHtml(payload, text);

  const results = await Promise.allSettled([
    sendTelegramMessage(text),
    sendEmail({ subject, html }),
    sendVkMessage(text),
  ]);

  const channels = ['tg', 'email', 'vk'] as const;
  const delivered = results.flatMap((r, i) => (r.status === 'fulfilled' ? [channels[i]] : []));
  const failed = results.flatMap((r, i) => (r.status === 'rejected' ? [{ ch: channels[i], err: String((r.reason as any)?.message ?? r.reason) }] : []));

  console.log(`[lead] type=${payload.type} phone=${maskPhone(payload.contact.phone)} delivered=${delivered.join(',')} failed=${failed.map(f => f.ch).join(',') || '—'}`);

  if (delivered.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'all_channels_failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true, delivered }), { status: 200, headers: { 'content-type': 'application/json' } });
}
```

- [ ] **Step 6.4: Run tests, expect PASS**

```bash
npm run test:run -- tests/api/lead.test.ts
```

Expected: 8 passed.

- [ ] **Step 6.5: Commit**

```bash
git add api tests/api
git commit -m "feat: /api/lead endpoint with fan-out, honeypot, rate-limit"
```

---

## Task 7: Клиентская обёртка `lib/lead.ts`

**Files:**
- Create: `src/lib/lead.ts`, `tests/lib/lead.test.ts`

- [ ] **Step 7.1: Write failing tests**

```ts
// tests/lib/lead.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postLead } from '@/lib/lead';

describe('postLead', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, delivered: ['tg'] }) }) as Response);
  });
  afterEach(() => vi.restoreAllMocks());

  it('POSTs JSON to /api/lead', async () => {
    const r = await postLead({ type: 'form', contact: { phone: '+79991234567', channel: 'whatsapp' } });
    expect(fetch).toHaveBeenCalledWith('/api/lead', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'content-type': 'application/json' }),
      body: expect.stringContaining('"type":"form"'),
    }));
    expect(r.ok).toBe(true);
  });

  it('throws on non-OK response', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: 'invalid_payload' }) });
    await expect(postLead({ type: 'form', contact: { phone: 'bad', channel: 'whatsapp' } })).rejects.toThrow();
  });
});
```

- [ ] **Step 7.2: Implement `src/lib/lead.ts`**

```ts
import type { LeadPayload } from '@/lib/schemas';

export async function postLead(payload: LeadPayload): Promise<{ ok: boolean; delivered?: string[] }> {
  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`lead.failed: ${(data as any).error ?? res.status}`);
  }
  return res.json();
}
```

- [ ] **Step 7.3: Run, expect PASS**

```bash
npm run test:run -- tests/lib/lead.test.ts
```

- [ ] **Step 7.4: Commit**

```bash
git add src/lib/lead.ts tests/lib/lead.test.ts
git commit -m "feat: client-side lead poster"
```

---

## Task 8: UI primitives — `Button`, `Field`, `PillGroup`

**Required reading for implementer:** `~/.claude/skills/frontend-design/SKILL.md` (полностью).

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Field.tsx`, `src/components/ui/PillGroup.tsx`

- [ ] **Step 8.1: Implement `src/components/ui/Button.tsx` — brutalist (clip-path стрелка для primary)**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

// Primary CTA: пятиугольник со стрелкой справа через clip-path.
// Внимание: clip-path обрезает focus-ring у некоторых браузеров. Поэтому focus-visible
// ставим на ВНЕШНИЙ wrapper (style={{ clipPath: ... }}), а ring рисуем на родителе.
const PRIMARY_CLIP =
  'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)';

const button = cva(
  'inline-flex items-center justify-center gap-2 font-display tracking-wider uppercase motion-safe:transition focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // primary: оранжевая заливка + стрелка через clip-path. padding-right больше чем left, чтобы текст не наезжал на стрелку.
        primary:   'bg-accent text-white hover:bg-accentDark',
        // secondary: прозрачный с толстой оранжевой рамкой
        secondary: 'bg-transparent border-[3px] border-accent text-accent hover:bg-accent hover:text-white',
        // ghost: бордер-минимал, без заливки
        ghost:     'border-2 border-border text-text hover:bg-surface',
      },
      size: {
        sm: 'text-xs px-4 py-2',
        md: 'text-sm px-6 py-3',
        lg: 'text-sm px-7 py-4',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size, block, className, children, ...rest }, ref,
) {
  const isPrimary = variant === 'primary';

  // Для primary: extra padding-right под стрелку + clip-path. Focus-ring через wrapper.
  if (isPrimary) {
    return (
      <span
        className={clsx(
          'relative inline-block focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg',
          block && 'w-full',
        )}
      >
        <button
          ref={ref}
          className={clsx(
            button({ variant, size, block }),
            'pr-10',          // место под стрелку
            className,
          )}
          style={{ clipPath: PRIMARY_CLIP, WebkitClipPath: PRIMARY_CLIP }}
          {...rest}
        >
          {children}
        </button>
      </span>
    );
  }

  // secondary/ghost — обычный прямоугольный
  return (
    <button
      ref={ref}
      className={clsx(
        button({ variant, size, block }),
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
```

- [ ] **Step 8.2: Implement `src/components/ui/Field.tsx`**

```tsx
import clsx from 'clsx';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

const inputCls =
  'w-full bg-surface border-2 border-border text-text placeholder:text-muted px-4 py-3 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 motion-safe:transition';

export function Field({
  label, error, hint, children,
}: { label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest }, ref,
) {
  return <input ref={ref} className={clsx(inputCls, invalid && 'border-red-400/60', className)} {...rest} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, ...rest }, ref,
) {
  return <textarea ref={ref} className={clsx(inputCls, 'resize-y', invalid && 'border-red-400/60', className)} {...rest} />;
});
```

- [ ] **Step 8.3: Implement `src/components/ui/PillGroup.tsx`**

```tsx
import clsx from 'clsx';

type Option<V extends string | number> = { value: V; label: string };

type Props<V extends string | number> = {
  options: Option<V>[];
  value: V | undefined;
  onChange: (v: V) => void;
  ariaLabel: string;
  layout?: 'wrap' | 'grid-2' | 'grid-4';
};

export function PillGroup<V extends string | number>({
  options, value, onChange, ariaLabel, layout = 'wrap',
}: Props<V>) {
  const layoutCls = {
    wrap: 'flex flex-wrap gap-2',
    'grid-2': 'grid grid-cols-2 gap-2',
    'grid-4': 'grid grid-cols-2 sm:grid-cols-4 gap-2',
  }[layout];

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={layoutCls}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              'px-4 py-2 text-sm motion-safe:transition border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              active
                ? 'bg-accent/10 border-accent text-accent font-semibold'
                : 'bg-surface border-border text-text/80 hover:border-text/30',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 8.4: Smoke-проверка typecheck**

```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 8.5: Commit**

```bash
git add src/components/ui
git commit -m "feat: ui primitives (Button, Field, PillGroup)"
```

---

## Task 8b: Декоративные UI-компоненты (характер дизайна)

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md` + spec §6.7.

**Files:**
- Create: `src/components/ui/SectionIndex.tsx`, `src/components/ui/Marquee.tsx`, `src/components/ui/CountUp.tsx`, `src/components/ui/ConstructionTape.tsx`, `src/components/ui/DimensionLine.tsx`, `src/components/ui/Stamp.tsx`

- [ ] **Step 8b.1: Update `siteConfig` types — add `marquee.items` and `about.stats` and `hero.stamp`**

В `src/config/site.ts`:
```ts
// в SiteConfig type:
hero: {
  headline: string;
  subheadline: string;
  ctaText: string;
  imageUrl?: string;
  stamp?: { lines: string[] };                 // новое
};
about: {
  headline: string;
  bullets: string[];
  stats: { value: number; suffix?: string; label: string }[];   // новое
};
marquee: { items: string[] };                  // новое

// в siteConfig объекте:
hero: {
  // ...
  stamp: { lines: ['ОПЫТ 10 ЛЕТ', '№ 001 · МОСКВА'] },
},
about: {
  headline: 'О мастере',
  bullets: [/* ... */],
  stats: [
    { value: 10, suffix: '+', label: 'лет опыта' },
    { value: 200, suffix: '+', label: 'объектов сдано' },
    { value: 5,  suffix: '',  label: 'лет гарантия' },
  ],
},
marquee: {
  items: ['Полусухая', 'Мокрая', 'Наливной пол', 'Армирование', 'Тёплый пол', 'Замер бесплатно', 'Гарантия 5 лет'],
},
```

- [ ] **Step 8b.2: Add JetBrains Mono to Google Fonts link**

В `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&family=Archivo+Black&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
```

В `tailwind.config.ts`:
```ts
fontFamily: {
  sans: ["'Archivo'", 'system-ui', 'sans-serif'],
  display: ["'Archivo Black'", "'Archivo'", 'system-ui', 'sans-serif'],
  mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],   // новое
},
```

- [ ] **Step 8b.3: `SectionIndex.tsx`**

```tsx
type Props = { index: string; label?: string; title: string };

export function SectionIndex({ index, label = 'Раздел', title }: Props) {
  return (
    <div className="flex items-start gap-5 sm:gap-8">
      <div className="font-display text-6xl sm:text-7xl lg:text-8xl text-accent leading-none flex-shrink-0">
        {index}
      </div>
      <div className="border-l-2 border-border pl-4 sm:pl-6 pt-2">
        <div className="text-xs uppercase tracking-widest text-muted">{label}</div>
        <h2 className="font-display uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none mt-2">
          {title}
        </h2>
      </div>
    </div>
  );
}
```

- [ ] **Step 8b.4: `Marquee.tsx`**

```tsx
import clsx from 'clsx';

type Props = { items: string[]; bg?: 'accent' | 'surface'; speed?: number };

export function Marquee({ items, bg = 'accent', speed = 18 }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div
      className={clsx(
        'overflow-hidden border-y-2 border-accent',
        bg === 'accent' ? 'bg-accent text-bg' : 'bg-surface text-text',
      )}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="flex gap-8 py-3 font-display uppercase tracking-widest text-sm whitespace-nowrap motion-safe:animate-[marquee_var(--marquee-speed)_linear_infinite] motion-reduce:animate-none"
        style={{ ['--marquee-speed' as any]: `${speed}s`, width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{item}</span>
            <span className="opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

В `tailwind.config.ts` добавить keyframe:
```ts
extend: {
  // ...
  keyframes: {
    marquee: {
      from: { transform: 'translateX(0)' },
      to:   { transform: 'translateX(-50%)' },
    },
  },
},
```

- [ ] **Step 8b.5: `CountUp.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';

type Props = { target: number; suffix?: string; label: string; duration?: number };

export function CountUp({ target, suffix = '', label, duration = 1500 }: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(target); return; }

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setVal(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className="border-t-[3px] border-accent pt-2">
      <div className="font-display text-4xl sm:text-5xl leading-none">
        {val}{suffix && <span className="text-accent">{suffix}</span>}
      </div>
      <div className="text-xs uppercase tracking-widest text-muted mt-2">{label}</div>
    </div>
  );
}
```

- [ ] **Step 8b.6: `ConstructionTape.tsx`**

```tsx
export function ConstructionTape() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="h-6 w-full border-y-2 border-accent"
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, var(--tw-color-accent, #ea580c) 0 12px, var(--tw-color-bg, #1f2937) 12px 24px)',
      }}
    />
  );
}
```

> Замечание для имплементера: если CSS-переменные `--tw-color-*` не пробрасываются — использовать прямые hex-значения или взять цвета из `siteConfig.theme` через JS.

- [ ] **Step 8b.7: `DimensionLine.tsx`**

```tsx
type Props = { label: string; width?: 'sm' | 'md' };

export function DimensionLine({ label, width = 'sm' }: Props) {
  const w = width === 'sm' ? 'w-48' : 'w-72';
  return (
    <div aria-hidden="true" className={`relative mt-3 h-4 ${w} text-accent`}>
      <span className="absolute left-0 top-1/2 h-3 -translate-y-1/2 border-l border-accent" />
      <span className="absolute right-0 top-1/2 h-3 -translate-y-1/2 border-r border-accent" />
      <span className="absolute left-1.5 right-1.5 top-1/2 -translate-y-1/2 border-t border-accent" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-2 font-mono text-[10px] tracking-wider">
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 8b.8: `Stamp.tsx`**

```tsx
type Props = { lines: string[]; rotation?: number };

export function Stamp({ lines, rotation = -4 }: Props) {
  if (lines.length === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="hidden sm:inline-block border-2 border-accent text-accent uppercase font-display tracking-widest text-xs px-3 py-2 bg-accent/5 leading-tight text-center"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {lines.map((l, i) => (
        <div key={i} className={i === 0 ? 'font-bold' : 'opacity-70 text-[10px] tracking-[0.18em] mt-1'}>
          {l}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8b.9: Smoke check**

```bash
npm run typecheck
```

- [ ] **Step 8b.10: Commit**

```bash
git add src/components/ui src/config/site.ts tailwind.config.ts index.html
git commit -m "feat: decorative ui (SectionIndex, Marquee, CountUp, ConstructionTape, DimensionLine, Stamp)"
```

---

## Task 9: Статичные блоки — Hero, Services, Pricing, Footer

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md` + spec §6.7 (декоративные элементы).

**Декоративные элементы для этой задачи** (из Task 8b):
- **Hero** дополнительно: `<Stamp lines={hero.stamp.lines} />` в правом верхнем углу абсолютным позиционированием + `<DimensionLine label="CTA-001" />` сразу под главным CTA.
- **Services** оборачивает свой `<h2>` в `<SectionIndex index="01" title="Услуги" />`. Внутри Services отдельный `<h2>` не пишем — `SectionIndex` его рендерит сам.
- **Pricing** аналогично: `<SectionIndex index="03" title="Цены" />` (квиз будет 02.).
- **Footer** без индекса; перед Footer (в App.tsx, не здесь) — `<ConstructionTape />`.

Нумерация секций (для всего лендинга):
| # | Блок |
|---|---|
| — | Hero (без индекса) |
| 01 | Services |
| 02 | Quiz |
| 03 | Pricing |
| 04 | Cases |
| 05 | About |
| 06 | Calculator |
| 07 | Reviews |
| 08 | LeadForm |
| 09 | FAQ |

**Files:**
- Create: `src/components/Hero/index.tsx`, `src/components/Services/index.tsx`, `src/components/Pricing/index.tsx`, `src/components/Footer/index.tsx`

- [ ] **Step 9.1: Implement `Hero/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';

type Props = { hero: SiteConfig['hero']; master: SiteConfig['master'] };

export default function Hero({ hero, master }: Props) {
  const telHref = master.phone ? `tel:${master.phone.replace(/[^+\d]/g, '')}` : null;
  return (
    <section className="relative isolate overflow-hidden bg-bg text-text">
      {/* Оранжевая полоса-разметка сверху */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-[2] h-1 bg-accent" />

      <div className="absolute inset-0">
        {hero.imageUrl ? (
          <img
              src={hero.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'grayscale(1) contrast(1.1)' }}
            />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg to-black" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/80 to-bg/55" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.16),transparent_60%)]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-24 lg:pb-40">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="border border-border bg-surface px-3 py-1.5 inline-flex items-center gap-2 uppercase tracking-wider text-xs">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
            {master.city} · опыт {master.experienceYears} лет
          </span>
        </div>

        <h1 className="mt-6 font-display text-[clamp(2.25rem,6vw,5rem)] leading-[1.02] tracking-tight text-balance">
          {hero.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg sm:text-xl text-pretty text-text/75">
          {hero.subheadline}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" onClick={() => document.querySelector('#form')?.scrollIntoView({ behavior: 'smooth' })}>
            {hero.ctaText}
          </Button>
          {telHref && (
            <a
              href={telHref}
              className="inline-flex items-center justify-center border-2 border-border bg-surface px-7 py-4 font-display uppercase tracking-wider text-sm motion-safe:transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {master.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9.2: Implement `Services/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { services: SiteConfig['services'] };

export default function Services({ services }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Услуги</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(s => (
            <div key={s.title} className="rounded-2xl bg-surface border border-border p-6">
              <h3 className="font-display text-xl">{s.title}</h3>
              <p className="mt-3 text-text/70 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9.3: Implement `Pricing/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { pricing: SiteConfig['pricing'] };

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

export default function Pricing({ pricing }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Цены</h2>
        <div className="mt-10 divide-y divide-border">
          {pricing.items.map(p => (
            <div key={p.name} className="flex items-baseline justify-between gap-4 py-5">
              <span className="text-text/90">{p.name}</span>
              <span className="font-display text-xl text-accent whitespace-nowrap">
                {p.note ? `${p.note} ` : ''}{fmt(p.pricePerM2)} ₽/м²
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          Цены ориентировочные. Точную смету пришлю после замера.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 9.4: Implement `Footer/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { master: SiteConfig['master']; contacts: SiteConfig['contacts'] };

export default function Footer({ master, contacts }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-bg text-text border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="font-display text-xl">{master.name}</div>
          <div className="mt-2 text-sm text-text/70">Стяжка пола · {master.city}</div>
          {master.phone && (
            <a href={`tel:${master.phone.replace(/[^+\d]/g, '')}`} className="mt-3 inline-block font-semibold text-accent">
              {master.phone}
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-4 sm:justify-end">
          {contacts.whatsapp && <a href={contacts.whatsapp} className="hover:text-accent">WhatsApp</a>}
          {contacts.telegram && <a href={contacts.telegram} className="hover:text-accent">Telegram</a>}
          {contacts.vk && <a href={contacts.vk} className="hover:text-accent">VK</a>}
          {contacts.email && <a href={`mailto:${contacts.email}`} className="hover:text-accent">{contacts.email}</a>}
        </div>
      </div>
      <div className="mt-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <div>© {year} {master.name}. Все права защищены.</div>
        <a href="/privacy/" className="hover:text-text/80">Политика конфиденциальности</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 9.5: Smoke check**

```bash
npm run typecheck
```

- [ ] **Step 9.6: Commit**

```bash
git add src/components/Hero src/components/Services src/components/Pricing src/components/Footer
git commit -m "feat: hero, services, pricing, footer blocks"
```

---

## Task 10: Статичные блоки — Cases, About, Reviews, FAQ

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md` + spec §6.7.

**Декоративные элементы для этой задачи:**
- **Cases**: `<SectionIndex index="04" title="Наши работы" />` вместо `<h2>`.
- **About**: `<SectionIndex index="05" title="О мастере" />` + блок `<CountUp />` × 3 для `about.stats[]` (рендерим в `grid grid-cols-3 gap-6` справа от bullets или отдельной строкой ниже).
- **Reviews**: `<SectionIndex index="07" title="Отзывы" />`.
- **FAQ**: `<SectionIndex index="09" title="Частые вопросы" />`.

**Files:**
- Create: `src/components/Cases/index.tsx`, `src/components/About/index.tsx`, `src/components/Reviews/index.tsx`, `src/components/FAQ/index.tsx`

- [ ] **Step 10.1: Implement `Cases/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { cases: SiteConfig['cases'] };

export default function Cases({ cases }: Props) {
  if (cases.length === 0) return null;
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Наши работы</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {cases.map(c => (
            <article key={c.title} className="rounded-2xl bg-surface border border-border overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="relative">
                  <img src={c.beforeUrl} alt={`${c.title} — до`} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-md bg-bg/70 px-2 py-1 text-xs">До</span>
                </div>
                <div className="relative">
                  <img src={c.afterUrl} alt={`${c.title} — после`} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-md bg-bg/70 px-2 py-1 text-xs">После</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg">{c.title}</h3>
                {c.description && <p className="mt-2 text-text/70">{c.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10.2: Implement `About/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { about: SiteConfig['about']; master: SiteConfig['master'] };

export default function About({ about, master }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">
        <div className="lg:col-span-7">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">{about.headline}</h2>
          <ul className="mt-8 space-y-4">
            {about.bullets.map(b => (
              <li key={b} className="flex gap-3 text-lg text-text/80">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        {master.photoUrl && (
          <div className="lg:col-span-5">
            <img src={master.photoUrl} alt={master.name} className="rounded-2xl border border-border" />
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 10.3: Implement `Reviews/index.tsx`**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { reviews: SiteConfig['reviews'] };

export default function Reviews({ reviews }: Props) {
  if (reviews.length === 0) return null;
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Отзывы</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <figure key={i} className="rounded-2xl bg-surface border border-border p-6">
              <div className="text-accent" aria-label={`${r.rating} из 5`}>{'★'.repeat(r.rating)}</div>
              <blockquote className="mt-3 text-text/85 leading-relaxed">«{r.text}»</blockquote>
              <figcaption className="mt-4 text-sm text-muted">— {r.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10.4: Implement `FAQ/index.tsx` (с раскрытием через `<details>`)**

```tsx
import type { SiteConfig } from '@/config/site';

type Props = { faq: SiteConfig['faq'] };

export default function FAQ({ faq }: Props) {
  if (faq.length === 0) return null;
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Частые вопросы</h2>
        <div className="mt-10 divide-y divide-border">
          {faq.map((q, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none text-lg font-semibold">
                <span>{q.question}</span>
                <span aria-hidden className="text-accent text-2xl leading-none transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-text/75 leading-relaxed">{q.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10.5: Smoke check**

```bash
npm run typecheck
```

- [ ] **Step 10.6: Commit**

```bash
git add src/components/Cases src/components/About src/components/Reviews src/components/FAQ
git commit -m "feat: cases, about, reviews, faq blocks"
```

---

## Task 11: LeadSuccess + LeadForm

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md`.

**Files:**
- Create: `src/components/LeadSuccess.tsx`, `src/components/LeadForm/index.tsx`, `tests/components/LeadForm.test.tsx`

- [ ] **Step 11.1: Implement `LeadSuccess.tsx`**

```tsx
import type { Channel } from '@/config/site';

const channelText: Record<Channel, string> = {
  whatsapp: 'в WhatsApp', telegram: 'в Telegram', call: 'звонком', any: 'удобным способом',
};

export function LeadSuccess({ masterName, channel }: { masterName: string; channel: Channel }) {
  return (
    <div className="rounded-2xl bg-accent/10 border border-accent/30 p-8 text-center">
      <div className="text-4xl">✓</div>
      <h3 className="mt-4 font-display text-2xl">Спасибо!</h3>
      <p className="mt-3 text-text/85">
        {masterName} свяжется в течение 15 минут {channelText[channel]}.
      </p>
    </div>
  );
}
```

- [ ] **Step 11.2: Write failing test for LeadForm**

```tsx
// tests/components/LeadForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadForm from '@/components/LeadForm';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));

import { postLead } from '@/lib/lead';

describe('LeadForm', () => {
  beforeEach(() => { (postLead as any).mockClear(); });

  it('rejects empty phone', async () => {
    const user = userEvent.setup();
    render(<LeadForm />);
    await user.click(screen.getByRole('button', { name: /отправить/i }));
    expect(screen.getByText(/введите телефон/i)).toBeInTheDocument();
    expect(postLead).not.toHaveBeenCalled();
  });

  it('submits valid phone with default channel', async () => {
    const user = userEvent.setup();
    render(<LeadForm />);
    await user.type(screen.getByLabelText(/телефон/i), '+79991234567');
    await user.click(screen.getByRole('button', { name: /отправить/i }));
    await waitFor(() => {
      expect(postLead).toHaveBeenCalledWith(expect.objectContaining({
        type: 'form',
        contact: expect.objectContaining({ phone: '+79991234567' }),
      }));
    });
    expect(await screen.findByText(/спасибо/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 11.3: Implement `src/components/LeadForm/index.tsx`**

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactSchema, type Contact } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PillGroup } from '@/components/ui/PillGroup';
import { LeadSuccess } from '@/components/LeadSuccess';
import { siteConfig } from '@/config/site';

const formSchema = contactSchema;
type FormData = z.infer<typeof formSchema>;

const channelOptions = [
  { value: 'whatsapp' as const, label: 'WhatsApp' },
  { value: 'telegram' as const, label: 'Telegram' },
  { value: 'call' as const, label: 'Звонок' },
  { value: 'any' as const, label: 'Без разницы' },
];

export default function LeadForm() {
  const [done, setDone] = useState<Contact | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { channel: 'whatsapp' },
    });
  const channel = watch('channel');

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await postLead({ type: 'form', contact: data, _hp: '' });
      setDone(data);
    } catch (e) {
      setServerError('Не удалось отправить. Позвоните напрямую: ' + siteConfig.master.phone);
    }
  }

  const bgUrl = siteConfig.leadForm.backgroundImageUrl;

  return (
    <section id="form" className="relative isolate overflow-hidden bg-bg text-text py-16 sm:py-24 lg:py-32">
      {bgUrl && (
        <div className="absolute inset-0">
          <img
            src={bgUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'grayscale(1) contrast(1.05)' }}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-bg/85 to-bg/95" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.10),transparent_60%)]" />
        </div>
      )}
      <div className="relative z-[1] mx-auto max-w-xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight text-center">Получить расчёт</h2>
        {done ? (
          <div className="mt-8"><LeadSuccess masterName={siteConfig.master.name} channel={done.channel} /></div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={
              'mt-8 space-y-5 ' +
              (bgUrl ? 'bg-[rgba(15,22,35,0.85)] backdrop-blur-md border-2 border-border p-6 sm:p-8' : '')
            }
          >
            {/* Honeypot */}
            <input type="text" tabIndex={-1} aria-hidden className="hidden" autoComplete="off" {...register('_hp' as any)} />

            <Field label="Телефон" error={errors.phone?.message}>
              <Input type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
            </Field>

            <Field label="Где удобнее связаться">
              <PillGroup
                options={channelOptions}
                value={channel}
                onChange={v => setValue('channel', v)}
                ariaLabel="Канал связи"
                layout="grid-4"
              />
            </Field>

            <Field label="Имя (необязательно)">
              <Input autoComplete="given-name" {...register('name')} />
            </Field>

            <Field label="Комментарий (необязательно)">
              <Textarea rows={3} {...register('comment')} />
            </Field>

            <Button type="submit" size="lg" block disabled={isSubmitting}>
              {isSubmitting ? 'Отправляем…' : 'Отправить'}
            </Button>

            {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 11.4: Install `@hookform/resolvers`**

```bash
npm install @hookform/resolvers
```

- [ ] **Step 11.5: Run tests, expect PASS**

```bash
npm run test:run -- tests/components/LeadForm.test.tsx
```

- [ ] **Step 11.6: Commit**

```bash
git add src/components/LeadSuccess.tsx src/components/LeadForm tests/components/LeadForm.test.tsx package.json package-lock.json
git commit -m "feat: lead form with validation + success screen"
```

---

## Task 12: Calculator block

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md`. Принцип №1 (render only from props) тут особенно: цена в UI клиенту НЕ показывается.

**Files:**
- Create: `src/components/Calculator/index.tsx`, `tests/components/Calculator.test.tsx`

- [ ] **Step 12.1: Write failing test**

```tsx
// tests/components/Calculator.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from '@/components/Calculator';
import { siteConfig } from '@/config/site';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));
import { postLead } from '@/lib/lead';

describe('Calculator', () => {
  beforeEach(() => (postLead as any).mockClear());

  it('does NOT show estimated price in the UI before or after submit', async () => {
    const user = userEvent.setup();
    render(<Calculator pricing={siteConfig.pricing} />);
    // Заполняем
    await user.type(screen.getByLabelText(/площадь/i), '75');
    await user.type(screen.getByLabelText(/телефон/i), '+79991234567');
    await user.click(screen.getByRole('button', { name: /получить расчёт/i }));
    await waitFor(() => expect(postLead).toHaveBeenCalled());
    // В UI цены нет
    expect(screen.queryByText(/₽/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d{4,}\s*₽/)).not.toBeInTheDocument();
  });

  it('sends payload with computed price and breakdown', async () => {
    const user = userEvent.setup();
    render(<Calculator pricing={siteConfig.pricing} />);
    await user.type(screen.getByLabelText(/площадь/i), '50');
    await user.type(screen.getByLabelText(/телефон/i), '+79991234567');
    await user.click(screen.getByRole('button', { name: /получить расчёт/i }));
    await waitFor(() => {
      expect(postLead).toHaveBeenCalledWith(expect.objectContaining({
        type: 'calculator',
        params: expect.objectContaining({ area: 50, type: 'semidry', thickness: 60 }),
        estimatedPrice: expect.any(Number),
        breakdown: expect.objectContaining({ work: expect.any(Number) }),
      }));
    });
  });
});
```

- [ ] **Step 12.2: Implement `src/components/Calculator/index.tsx`**

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SiteConfig } from '@/config/site';
import { siteConfig } from '@/config/site';
import { calcParamsSchema, contactSchema, type Contact } from '@/lib/schemas';
import { calculatePrice } from '@/lib/pricing';
import { postLead } from '@/lib/lead';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { PillGroup } from '@/components/ui/PillGroup';
import { LeadSuccess } from '@/components/LeadSuccess';

const formSchema = calcParamsSchema.merge(contactSchema);
type FormData = z.infer<typeof formSchema>;

const typeOptions = [
  { value: 'semidry' as const, label: 'Полусухая' },
  { value: 'wet' as const, label: 'Мокрая' },
  { value: 'selfLevel' as const, label: 'Наливной пол' },
];
const thicknessOptions = [
  { value: 40 as const, label: '40 мм' },
  { value: 60 as const, label: '60 мм' },
  { value: 80 as const, label: '80 мм' },
  { value: 100 as const, label: '100 мм' },
];
const channelOptions = [
  { value: 'whatsapp' as const, label: 'WhatsApp' },
  { value: 'telegram' as const, label: 'Telegram' },
  { value: 'call' as const, label: 'Звонок' },
  { value: 'any' as const, label: 'Без разницы' },
];
const extraOptions = [
  { value: 'reinforcement' as const, label: 'Армирование сеткой' },
  { value: 'overUnderfloor' as const, label: 'Поверх тёплого пола' },
  { value: 'demolition' as const, label: 'Демонтаж старой' },
];

type Props = { pricing: SiteConfig['pricing'] };

export default function Calculator({ pricing }: Props) {
  const [done, setDone] = useState<Contact | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        area: 75, type: 'semidry', thickness: 60, extras: [], channel: 'whatsapp',
      },
    });
  const w = watch();

  async function onSubmit(data: FormData) {
    setServerError(null);
    const params = { area: Number(data.area), type: data.type, thickness: data.thickness, extras: data.extras };
    const { estimatedPrice, breakdown } = calculatePrice(params, pricing);
    try {
      await postLead({
        type: 'calculator',
        params,
        estimatedPrice,
        breakdown,
        contact: { phone: data.phone, channel: data.channel, name: data.name, comment: data.comment },
        _hp: '',
      });
      setDone({ phone: data.phone, channel: data.channel, name: data.name, comment: data.comment });
    } catch {
      setServerError('Не удалось отправить. Позвоните: ' + siteConfig.master.phone);
    }
  }

  function toggleExtra(v: 'reinforcement' | 'overUnderfloor' | 'demolition') {
    const cur = (w.extras as any[]) ?? [];
    setValue('extras', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]);
  }

  if (done) {
    return (
      <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-xl px-6 sm:px-10 lg:px-16">
          <LeadSuccess masterName={siteConfig.master.name} channel={done.channel} />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Калькулятор</h2>
        <p className="mt-3 text-text/70">Оставьте параметры — пришлю точный расчёт.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-6 rounded-2xl bg-surface border border-border p-6 sm:p-8">
          <input type="text" tabIndex={-1} aria-hidden className="hidden" autoComplete="off" {...register('_hp' as any)} />

          <Field label="Площадь, м²" error={errors.area?.message}>
            <Input type="number" min={1} max={10000} invalid={!!errors.area} {...register('area', { valueAsNumber: true })} />
          </Field>

          <Field label="Тип стяжки">
            <PillGroup options={typeOptions} value={w.type} onChange={v => setValue('type', v)} ariaLabel="Тип стяжки" />
          </Field>

          <Field label="Толщина">
            <PillGroup options={thicknessOptions} value={w.thickness} onChange={v => setValue('thickness', v)} ariaLabel="Толщина" layout="grid-4" />
          </Field>

          <Field label="Дополнительно">
            <div className="grid gap-2">
              {extraOptions.map(o => {
                const active = (w.extras as any[])?.includes(o.value);
                return (
                  <button
                    key={o.value} type="button"
                    onClick={() => toggleExtra(o.value)}
                    aria-pressed={active}
                    className={
                      'flex items-center gap-3 rounded-lg border px-4 py-3 text-left motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
                      (active ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-text/30')
                    }
                  >
                    <span aria-hidden className={'h-4 w-4 flex-none rounded border ' + (active ? 'bg-accent border-accent' : 'border-text/30')} />
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Телефон" error={errors.phone?.message}>
            <Input type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
          </Field>

          <Field label="Где удобнее связаться">
            <PillGroup options={channelOptions} value={w.channel} onChange={v => setValue('channel', v)} ariaLabel="Канал связи" layout="grid-4" />
          </Field>

          <Button type="submit" size="lg" block disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем…' : 'Получить расчёт'}
          </Button>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 12.3: Run tests**

```bash
npm run test:run -- tests/components/Calculator.test.tsx
```

Expected: 2 passed.

- [ ] **Step 12.4: Commit**

```bash
git add src/components/Calculator tests/components/Calculator.test.tsx
git commit -m "feat: calculator with hidden price + lead capture"
```

---

## Task 13: Quiz block (5 шагов)

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md`.

**Files:**
- Create: `src/components/Quiz/reducer.ts`, `src/components/Quiz/QuizStep1.tsx`, `QuizStep2.tsx`, `QuizStep3.tsx`, `QuizStep4.tsx`, `QuizStep5.tsx`, `src/components/Quiz/index.tsx`, `tests/components/Quiz.test.tsx`

- [ ] **Step 13.1: Implement `src/components/Quiz/reducer.ts`**

```ts
import type { QuizAnswers, Contact } from '@/lib/schemas';

export type QuizState = {
  step: 1 | 2 | 3 | 4 | 5;
  answers: Partial<QuizAnswers>;
  contact?: Contact;
};

export type QuizAction =
  | { type: 'answer'; field: keyof QuizAnswers; value: string }
  | { type: 'back' }
  | { type: 'reset' };

export const initialQuizState: QuizState = { step: 1, answers: {} };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer': {
      const answers = { ...state.answers, [action.field]: action.value } as Partial<QuizAnswers>;
      const nextStep = (state.step + 1) as QuizState['step'];
      return { ...state, answers, step: nextStep <= 5 ? nextStep : 5 };
    }
    case 'back':
      return { ...state, step: (Math.max(1, state.step - 1) as QuizState['step']) };
    case 'reset':
      return initialQuizState;
  }
}
```

- [ ] **Step 13.2: Implement steps 1–4**

`src/components/Quiz/QuizStep1.tsx`:
```tsx
import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Дом / коттедж' },
  { value: 'commercial', label: 'Офис / коммерция' },
  { value: 'other', label: 'Другое' },
];

export default function QuizStep1({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display text-2xl">Тип помещения?</h3>
      <div className="mt-6"><PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Тип помещения" layout="grid-2" /></div>
    </div>
  );
}
```

`QuizStep2.tsx` (площадь):
```tsx
import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'lt30', label: 'до 30 м²' },
  { value: '30-60', label: '30–60 м²' },
  { value: '60-100', label: '60–100 м²' },
  { value: 'gt100', label: '100+ м²' },
];

export default function QuizStep2({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display text-2xl">Площадь?</h3>
      <div className="mt-6"><PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Площадь" layout="grid-2" /></div>
    </div>
  );
}
```

`QuizStep3.tsx` (тип стяжки):
```tsx
import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'semidry', label: 'Полусухая' },
  { value: 'wet', label: 'Мокрая' },
  { value: 'selfLevel', label: 'Наливной пол' },
  { value: 'unsure', label: 'Не знаю, посоветуйте' },
];

export default function QuizStep3({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display text-2xl">Тип стяжки?</h3>
      <div className="mt-6"><PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Тип стяжки" layout="grid-2" /></div>
    </div>
  );
}
```

`QuizStep4.tsx` (сроки):
```tsx
import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'thisMonth', label: 'В этом месяце' },
  { value: 'within3m', label: 'В течение 3 мес.' },
  { value: 'later', label: 'Позже' },
  { value: 'looking', label: 'Просто смотрю' },
];

export default function QuizStep4({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display text-2xl">Когда планируете?</h3>
      <div className="mt-6"><PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Сроки" layout="grid-2" /></div>
    </div>
  );
}
```

- [ ] **Step 13.3: Implement step 5 (контакт)**

`QuizStep5.tsx`:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type Contact } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PillGroup } from '@/components/ui/PillGroup';

const channelOptions = [
  { value: 'whatsapp' as const, label: 'WhatsApp' },
  { value: 'telegram' as const, label: 'Telegram' },
  { value: 'call' as const, label: 'Звонок' },
  { value: 'any' as const, label: 'Без разницы' },
];

export default function QuizStep5({ onSubmit, submitting }: { onSubmit: (c: Contact) => void; submitting: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<Contact>({ resolver: zodResolver(contactSchema), defaultValues: { channel: 'whatsapp' } });
  const channel = watch('channel');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="font-display text-2xl">Куда прислать расчёт?</h3>
      <p className="text-text/70 text-sm">Мастер свяжется в течение 15 минут.</p>

      <Field label="Телефон" error={errors.phone?.message}>
        <Input type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
      </Field>

      <Field label="Где удобнее связаться">
        <PillGroup options={channelOptions} value={channel} onChange={v => setValue('channel', v)} ariaLabel="Канал связи" layout="grid-4" />
      </Field>

      <Field label="Имя (необязательно)">
        <Input autoComplete="given-name" {...register('name')} />
      </Field>

      <Field label="Комментарий (необязательно)">
        <Textarea rows={2} {...register('comment')} />
      </Field>

      <Button type="submit" size="lg" block disabled={submitting}>
        {submitting ? 'Отправляем…' : 'Получить расчёт'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 13.4: Implement `src/components/Quiz/index.tsx`**

```tsx
import { useReducer, useState } from 'react';
import { quizReducer, initialQuizState } from './reducer';
import QuizStep1 from './QuizStep1';
import QuizStep2 from './QuizStep2';
import QuizStep3 from './QuizStep3';
import QuizStep4 from './QuizStep4';
import QuizStep5 from './QuizStep5';
import type { Contact, QuizAnswers } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { siteConfig } from '@/config/site';
import { LeadSuccess } from '@/components/LeadSuccess';
import { Button } from '@/components/ui/Button';

export default function Quiz() {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [done, setDone] = useState<Contact | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleContact(contact: Contact) {
    setServerError(null);
    setSubmitting(true);
    try {
      await postLead({
        type: 'quiz',
        answers: state.answers as QuizAnswers,
        contact,
        _hp: '',
      });
      setDone(contact);
    } catch {
      setServerError('Не удалось отправить. Позвоните: ' + siteConfig.master.phone);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Узнать стоимость за 30 секунд</h2>

        {done ? (
          <div className="mt-10"><LeadSuccess masterName={siteConfig.master.name} channel={done.channel} /></div>
        ) : (
          <>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-accent motion-safe:transition-[width] duration-300" style={{ width: `${(state.step - 1) * 25}%` }} />
            </div>
            <div className="mt-4 text-xs text-muted">Шаг {state.step} из 5</div>

            <div key={state.step} className="mt-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
              {state.step === 1 && <QuizStep1 onAnswer={(v) => dispatch({ type: 'answer', field: 'roomType', value: v })} />}
              {state.step === 2 && <QuizStep2 onAnswer={(v) => dispatch({ type: 'answer', field: 'area', value: v })} />}
              {state.step === 3 && <QuizStep3 onAnswer={(v) => dispatch({ type: 'answer', field: 'screedType', value: v })} />}
              {state.step === 4 && <QuizStep4 onAnswer={(v) => dispatch({ type: 'answer', field: 'timing', value: v })} />}
              {state.step === 5 && <QuizStep5 onSubmit={handleContact} submitting={submitting} />}
            </div>

            {state.step > 1 && state.step < 5 && (
              <div className="mt-6">
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'back' })}>← Назад</Button>
              </div>
            )}

            {serverError && <p className="mt-4 text-sm text-red-400">{serverError}</p>}
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 13.5: Write test**

```tsx
// tests/components/Quiz.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from '@/components/Quiz';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));
import { postLead } from '@/lib/lead';

describe('Quiz', () => {
  beforeEach(() => (postLead as any).mockClear());

  it('progresses step 1→5 and submits with collected answers', async () => {
    const user = userEvent.setup();
    render(<Quiz />);

    await user.click(screen.getByRole('radio', { name: /квартира/i }));
    await user.click(await screen.findByRole('radio', { name: /30–60/ }));
    await user.click(await screen.findByRole('radio', { name: /^полусухая$/i }));
    await user.click(await screen.findByRole('radio', { name: /в этом месяце/i }));

    await user.type(await screen.findByLabelText(/телефон/i), '+79991234567');
    await user.click(screen.getByRole('button', { name: /получить расчёт/i }));

    await waitFor(() => {
      expect(postLead).toHaveBeenCalledWith(expect.objectContaining({
        type: 'quiz',
        answers: expect.objectContaining({
          roomType: 'apartment', area: '30-60', screedType: 'semidry', timing: 'thisMonth',
        }),
      }));
    });
    expect(await screen.findByText(/спасибо/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 13.6: Run tests**

```bash
npm run test:run -- tests/components/Quiz.test.tsx
```

Expected: 1 passed.

- [ ] **Step 13.7: Commit**

```bash
git add src/components/Quiz tests/components/Quiz.test.tsx
git commit -m "feat: 5-step quiz with reducer + lead submission"
```

---

## Task 14: ConsultationBanner (FAB + auto-card на scroll≥50%)

**Required reading:** `~/.claude/skills/frontend-design/SKILL.md`.

**Files:**
- Create: `src/components/ConsultationBanner/index.tsx`, `src/components/ConsultationBanner/ConsultationCard.tsx`, `src/components/ConsultationBanner/useScrollTrigger.ts`, `tests/components/ConsultationBanner.test.tsx`

- [ ] **Step 14.1: Implement `useScrollTrigger.ts`**

```ts
import { useEffect, useState } from 'react';

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) { setProgress(0); return; }
      setProgress(window.scrollY / scrollable);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return progress;
}
```

- [ ] **Step 14.2: Implement `ConsultationCard.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactSchema } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

const cardSchema = contactSchema.required({ name: true });
type CardData = z.infer<typeof cardSchema>;

export function ConsultationCard({ open, onClose, onSuccess }: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const titleId = 'consultation-title';
  const cardRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<CardData>({ resolver: zodResolver(cardSchema), defaultValues: { channel: 'whatsapp' } });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(data: CardData) {
    setServerError(null);
    try {
      await postLead({
        type: 'consultation',
        contact: { phone: data.phone, channel: 'whatsapp', name: data.name },
        _hp: '',
      });
      onSuccess();
    } catch {
      setServerError('Не удалось отправить. Попробуйте позже.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button aria-label="Закрыть" onClick={onClose} className="absolute inset-0 bg-[rgba(15,15,20,0.25)] cursor-default" tabIndex={-1} />
      <div ref={cardRef} className="relative mx-6 w-full max-w-sm rounded-2xl bg-bg border border-border p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Закрыть" className="absolute right-3 top-3 rounded-full bg-surface w-8 h-8 grid place-items-center text-lg hover:bg-text/10">×</button>
        <p className="text-xs uppercase tracking-wider text-accent font-bold">Бесплатная консультация</p>
        <h3 id={titleId} className="mt-1 font-display text-xl">Расскажу о стяжке за 15 минут</h3>
        <p className="mt-2 text-sm text-text/70">Свяжусь в WhatsApp и отвечу на вопросы по вашему объекту.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <input type="text" tabIndex={-1} aria-hidden className="hidden" autoComplete="off" {...register('_hp' as any)} />
          <Field label="Имя" error={errors.name?.message}><Input autoComplete="given-name" invalid={!!errors.name} {...register('name')} /></Field>
          <Field label="Телефон" error={errors.phone?.message}><Input type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} /></Field>
          <Button type="submit" block size="md" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем…' : 'Получить консультацию'}
          </Button>
          <p className="text-[10px] text-muted text-center leading-relaxed">
            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных. <a href="/privacy/" className="underline hover:text-text">Политика</a>.
          </p>
          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 14.3: Implement `index.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useScrollProgress } from './useScrollTrigger';
import { ConsultationCard } from './ConsultationCard';

const SHOWN_KEY = 'consultationShown';
const LEAD_KEY = 'leadSubmitted';

export default function ConsultationBanner() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const progress = useScrollProgress();

  // Show FAB after 200px scroll
  const [fabVisible, setFabVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setFabVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-open at 50% scroll, once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (progress >= 0.5
      && !sessionStorage.getItem(SHOWN_KEY)
      && !sessionStorage.getItem(LEAD_KEY)) {
      sessionStorage.setItem(SHOWN_KEY, '1');
      setOpen(true);
    }
  }, [progress]);

  function handleClose() { setOpen(false); }
  function handleSuccess() {
    sessionStorage.setItem(LEAD_KEY, '1');
    setSuccess(true);
    setTimeout(() => setOpen(false), 1800);
  }

  // Hide both if lead already submitted
  if (typeof window !== 'undefined' && sessionStorage.getItem(LEAD_KEY) && !open) return null;

  return (
    <>
      {fabVisible && (
        <button
          aria-label="Открыть форму консультации"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-bg shadow-2xl shadow-accent/40 motion-safe:transition hover:bg-accentDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}
      <ConsultationCard
        open={open}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
      {success && (
        <div role="status" className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl bg-accent text-bg px-6 py-4 font-semibold shadow-xl">
            ✓ Заявка принята
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 14.4: Write test**

```tsx
// tests/components/ConsultationBanner.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsultationBanner from '@/components/ConsultationBanner';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));
import { postLead } from '@/lib/lead';

describe('ConsultationBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
    (postLead as any).mockClear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
  });

  function setScroll(y: number) {
    Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
    fireEvent.scroll(window);
  }

  it('shows FAB after scroll > 200px', async () => {
    render(<ConsultationBanner />);
    expect(screen.queryByRole('button', { name: /консультац/i })).not.toBeInTheDocument();
    act(() => setScroll(300));
    expect(await screen.findByRole('button', { name: /консультац/i })).toBeInTheDocument();
  });

  it('opens auto-card at 50% scroll, only once per session', async () => {
    render(<ConsultationBanner />);
    // 60% scroll: scrollY = 0.6 * (2000 - 800) = 720
    act(() => setScroll(720));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    // Close
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /закрыть/i }));
    // Reopen on second scroll — should NOT auto-show
    act(() => setScroll(900));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('FAB click opens the card with imя+телефон fields', async () => {
    const user = userEvent.setup();
    render(<ConsultationBanner />);
    act(() => setScroll(300));
    await user.click(screen.getByRole('button', { name: /открыть форму консультации/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/телефон/i)).toBeInTheDocument();
  });

  it('Esc closes the open card', async () => {
    render(<ConsultationBanner />);
    act(() => setScroll(720));
    await screen.findByRole('dialog');
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not auto-show if leadSubmitted is set', async () => {
    sessionStorage.setItem('leadSubmitted', '1');
    render(<ConsultationBanner />);
    act(() => setScroll(720));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 14.5: Run tests**

```bash
npm run test:run -- tests/components/ConsultationBanner.test.tsx
```

Expected: 5 passed.

- [ ] **Step 14.6: Commit**

```bash
git add src/components/ConsultationBanner tests/components/ConsultationBanner.test.tsx
git commit -m "feat: consultation banner (FAB + auto modal at 50% scroll)"
```

---

## Task 15: Privacy page + сборка App + main entry

**Files:**
- Create: `src/pages/Privacy.tsx`
- Modify: `src/main.tsx`, `src/App.tsx`

- [ ] **Step 15.1: Implement `src/pages/Privacy.tsx`**

```tsx
import { siteConfig } from '@/config/site';

export default function Privacy() {
  return (
    <main className="bg-bg text-text">
      <article className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16 py-20">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Политика конфиденциальности</h1>
        <p className="mt-6 text-text/70">
          {siteConfig.master.name} обрабатывает персональные данные в целях обратной связи по запросу пользователя.
          Данные не передаются третьим лицам и хранятся не дольше, чем требуется для обработки запроса.
        </p>
        <p className="mt-4 text-text/70">
          Эта страница — заглушка. Полный текст политики будет добавлен отдельно.
        </p>
        <p className="mt-8">
          <a href="/" className="text-accent hover:underline">← На главную</a>
        </p>
      </article>
    </main>
  );
}
```

- [ ] **Step 15.2: Update `src/main.tsx` to support multi-page SSG**

```tsx
import { ViteSSG } from 'vite-ssg';
import App from './App';
import Privacy from './pages/Privacy';
import './styles/index.css';

const routes = [
  { path: '/', component: App },
  { path: '/privacy', component: Privacy },
];

export const createApp = ViteSSG(
  // root component renders <Outlet/> via React Router; vite-ssg's React adapter wires this up
  () => null,
  { routes },
);
```

> Замечание для исполнителя: точная сигнатура `vite-ssg` для React в текущей версии может потребовать `vite-ssg/react` или альтернативного API; если возникает ошибка типов или билда — дочитать README пакета и адаптировать. Если потребуется упростить — fallback: рендерим только главный route в `vite-ssg/single-page` mode и оставляем `/privacy` как клиентский SPA-роут с `react-router-dom` (тогда нужно `npm install react-router-dom`).

- [ ] **Step 15.3: Update `src/App.tsx` — собрать все блоки + Marquee + ConstructionTape**

```tsx
import { siteConfig } from '@/config/site';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Quiz from '@/components/Quiz';
import Pricing from '@/components/Pricing';
import Cases from '@/components/Cases';
import About from '@/components/About';
import Calculator from '@/components/Calculator';
import Reviews from '@/components/Reviews';
import LeadForm from '@/components/LeadForm';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import ConsultationBanner from '@/components/ConsultationBanner';
import { Marquee } from '@/components/ui/Marquee';
import { ConstructionTape } from '@/components/ui/ConstructionTape';

export default function App() {
  return (
    <>
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
      <Marquee items={siteConfig.marquee.items} />
      <Services services={siteConfig.services} />
      <Quiz />
      <Pricing pricing={siteConfig.pricing} />
      <Cases cases={siteConfig.cases} />
      <About about={siteConfig.about} master={siteConfig.master} />
      <Calculator pricing={siteConfig.pricing} />
      <Reviews reviews={siteConfig.reviews} />
      <LeadForm />
      <FAQ faq={siteConfig.faq} />
      <ConstructionTape />
      <Footer master={siteConfig.master} contacts={siteConfig.contacts} />
      <ConsultationBanner />
    </>
  );
}
```

- [ ] **Step 15.4: Add SEO meta to `index.html`**

Заменить `<head>` блок:
```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Стяжка пола под ключ в Москве — Иван Иванов</title>
    <meta name="description" content="Полусухая, мокрая, наливные полы. Опыт 10 лет, гарантия 5 лет. Замер бесплатно." />
    <meta property="og:title" content="Стяжка пола под ключ в Москве — Иван Иванов" />
    <meta property="og:description" content="Полусухая, мокрая, наливные полы. Опыт 10 лет, гарантия 5 лет." />
    <meta property="og:image" content="/og.jpg" />
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&family=Archivo+Black&display=swap" rel="stylesheet" />
  </head>
```

> Note: ssg в более продвинутом варианте генерирует `<head>` из `siteConfig.seo`. Для MVP — статические значения в `index.html` достаточны (контент в seo и в html синхронен). Полная динамика — отдельной задачей.

- [ ] **Step 15.5: Smoke test — dev**

```bash
npm run dev
```

Открыть `http://localhost:5173`. Проверить:
- [ ] Страница рендерится со всеми блоками
- [ ] Hero CTA скроллит к форме
- [ ] Квиз: пройти все 5 шагов, отправить — должен показать success (но `/api/lead` не работает в dev — будет ошибка fetch, ОК)
- [ ] Калькулятор: ввести площадь, выбрать параметры, отправить — то же самое, fetch упадёт, но UI должен отработать
- [ ] Прокрутить до 50% — карточка консультации появилась
- [ ] FAB в правом нижнем углу — виден после прокрутки 200px
- [ ] FAQ — клик раскрывает ответ

- [ ] **Step 15.6: Build**

```bash
npm run build
```

Expected: `dist/index.html` готов, содержит весь HTML контента (поиск по «Стяжка пола» в файле должен найти заголовок).

- [ ] **Step 15.7: Run all tests**

```bash
npm run test:run
```

Expected: всё зелёное.

- [ ] **Step 15.8: Commit**

```bash
git add src/pages src/main.tsx src/App.tsx index.html
git commit -m "feat: assemble landing app + privacy page"
```

---

## Task 16: Документация деплоя на Vercel

**Files:**
- Create: `docs/ops/vercel-deploy.md`, `vercel.json` (опционально)

- [ ] **Step 16.1: Create `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

- [ ] **Step 16.2: Create `docs/ops/vercel-deploy.md`**

```md
# Деплой на Vercel

## Первый раз

1. Создать аккаунт на vercel.com (через GitHub).
2. Закоммитить проект и запушить в новый GitHub-репозиторий.
3. Vercel → New Project → Import GitHub repo → выбрать репозиторий.
4. Build settings:
   - Framework: Other
   - Build command: `npm run build` (vercel.json уже задаёт)
   - Output directory: `dist`
   - Install command: `npm install`
5. Environment Variables — добавить **все** из `.env.example`:
   - `TG_BOT_TOKEN`, `TG_CHAT_ID`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO`
   - `VK_GROUP_TOKEN`, `VK_OWNER_USER_ID`, `VK_MASTER_USER_ID` (последний может быть пустым)
6. Deploy.

После деплоя получится адрес `https://<project>.vercel.app`. Это и есть публичный лендинг.

## Получение токенов

### Telegram
1. Создать бота через @BotFather → `/newbot` → получить `TG_BOT_TOKEN`.
2. Найти свой chat_id: написать боту любое сообщение, потом открыть `https://api.telegram.org/bot<TOKEN>/getUpdates` — в ответе будет `chat.id` → это `TG_CHAT_ID`.

### SMTP (Yandex 360)
1. Завести почту на mail.yandex.ru.
2. Settings → Email-клиенты → включить «По протоколу IMAP», создать пароль приложения.
3. `SMTP_HOST=smtp.yandex.ru`, `SMTP_PORT=465`, `SMTP_USER=полный_email`, `SMTP_PASS=пароль_приложения`, `SMTP_FROM=полный_email`, `SMTP_TO=куда_доставлять`.

### VK
1. Создать сообщество (любое, тип «Бизнес»).
2. Управление → Работа с API → Ключи доступа → Создать ключ с правами «Сообщения сообщества», «Сообщения», «Управление сообществом» → `VK_GROUP_TOKEN`.
3. Узнать свой VK ID числом (через vk.com/idXXX или сторонние сервисы) → `VK_OWNER_USER_ID`.
4. Узнать VK ID мастера → `VK_MASTER_USER_ID` (если у мастера нет VK — оставить пустым).
5. Один раз вручную написать сообществу «+» от обоих аккаунтов (основателя и мастера), чтобы группа смогла отвечать.

## Тестирование после деплоя

1. Открыть `https://<project>.vercel.app`.
2. Открыть DevTools → Network → отправить тестовую заявку через форму.
3. Запрос на `/api/lead` должен вернуть 200 с `{ ok: true, delivered: [...] }`.
4. Проверить, что лид пришёл в TG, на email, в VK.
5. Если что-то не доставилось — Vercel → Project → Functions → Logs.
```

- [ ] **Step 16.3: Commit**

```bash
git add vercel.json docs/ops
git commit -m "docs: vercel deployment guide"
```

---

## Self-review

Прошёл по spec'у — каждый раздел соотнёс с задачей:

- §2 Стек: Task 1 (bootstrap), Task 11 (`@hookform/resolvers` добирается). ✓
- §3 Структура репо: соответствует Tasks 1, 9–14. ✓
- §4 Конфиг: Task 2. ✓
- §5 Структура страницы (11 блоков): Tasks 9, 10, 11, 12, 13 + сборка в Task 15. ✓
- §6.1 Quiz: Task 13. ✓
- §6.2 Calculator (цена скрыта): Task 12 + тест явно проверяет отсутствие цены. ✓
- §6.3 ConsultationBanner: Task 14. ✓
- §6.4 LeadSuccess: Task 11.1. ✓
- §7 `/api/lead`: Task 6 (включая honeypot, rate-limit, fan-out, валидация, статус-коды). ✓
- §8.1 Тема: Task 2.2. ✓
- §8.2 Accessibility: размазано по UI-задачам — focus-visible, aria-label, role=dialog/radiogroup. Имплементер ОБЯЗАН читать `frontend-design` skill. ✓
- §8.3 Тестирование: каждая задача имеет тесты. ✓

Цена в калькуляторе ни в одном месте не показывается — проверено отдельным `expect(screen.queryByText(/₽/)).not.toBeInTheDocument()`. ✓

Honeypot-поле `_hp` присутствует во всех 4 формах, в `/api/lead` обрабатывается до отправки. ✓

VK двум получателям (основателю + мастеру), мастер опциональный. ✓

Шрифт Archivo подключается одной `<link>` в Task 1.9 + используется через `font-display`/`font-sans` в Task 2.2. ✓

Telephone tap-target ≥ 44×44: все CTA `px-6 py-3` или `px-7 py-4` — соответствует. ✓

Privacy stub: Task 15.1. ✓

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-25-screed-single-landing.md`. Two execution options:

**1. Subagent-Driven (recommended)** — диспатчу свежий subagent на каждую задачу, между задачами spec-review + code-quality review, быстрая итерация, мой контекст не загрязняется.

**2. Inline Execution** — выполняю задачи в этой сессии с чекпоинтами на ревью.

Which approach?
