# План реализации MVP — Месяц 1 (стяжка пола)

> **Для агентного исполнителя:** обязательно использовать `superpowers:subagent-driven-development` (рекомендуется) или `superpowers:executing-plans`. Чек-боксы (`- [ ]`) — для отслеживания.

**Goal:** запустить 2 пилотных мастера по стяжке пола с собственными лендингами и стабильным потоком ≥ 5 заявок на каждого за 2 недели работы РК.

**Architecture:** один Next.js моно-проект под клиентские лендинги (мульти-арендный), шаблон с вариативными блоками, конфиг-JSON на каждого клиента, форма заявки → API → VK-бот + email + Google Sheet. Деплой на Vercel, поддомен на каждого мастера. **Агентский сайт — отдельный проект**, в этом плане не делается.

**Tech Stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS, Vercel hosting, VK Community API (`messages.send`), Nodemailer + SMTP Яндекс 360, Google Apps Script Web App как лог-webhook, Яндекс.Метрика, Яндекс.Директ.

**Допущения:**
- Исполнитель работает в `/home/ivan/renta/screed` (рабочая директория).
- Git инициализируется на шаге 1.
- Папка не пустая после Task 1: появляется `package.json`, `app/`, etc.
- AI-генерация контента (Claude/GPT) используется на этапе наполнения клиентских JSON — она не описывается в задачах как код, но является частью операционного процесса.

---

## Файловая структура

```
screed/
├── app/
│   ├── [clientSlug]/
│   │   ├── page.tsx              # рендер лендинга по конфигу клиента
│   │   └── layout.tsx            # SEO-мета на основе клиента
│   ├── api/
│   │   └── lead/route.ts         # POST: приём заявок с формы
│   ├── layout.tsx                # корневой layout
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── blocks/
│   │   │   ├── Hero/{HeroA,HeroB,HeroC}.tsx
│   │   │   ├── Services/{ServicesA,ServicesB}.tsx
│   │   │   ├── Pricing/{PricingA,PricingB}.tsx
│   │   │   ├── Cases/CasesA.tsx
│   │   │   ├── Reviews/ReviewsA.tsx
│   │   │   └── Form/LeadForm.tsx
│   │   └── BlockRenderer.tsx     # выбирает вариант блока по конфигу
│   ├── lib/
│   │   ├── vk.ts                 # отправка в VK
│   │   ├── email.ts              # SMTP отправка
│   │   ├── sheets.ts             # webhook в Apps Script
│   │   └── clients.ts            # загрузка JSON-конфигов
│   └── types/
│       └── client.ts             # тип ClientConfig
├── data/
│   └── clients/
│       └── <slug>.json           # конфиг каждого мастера
├── public/
│   └── clients/<slug>/           # фото работ мастера
├── tests/
│   └── api/lead.test.ts          # интеграционный тест воронки
├── docs/
│   └── ops/                      # бизнес-артефакты (договор, скрипты)
│       ├── contract-template.md
│       ├── master-onboarding-checklist.md
│       ├── avito-cold-outreach-script.md
│       ├── ai-prompt-client-config.md
│       └── weekly-report-template.md
├── .env.local                    # секреты (не в git)
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```

**Принципы декомпозиции:**
- Блок-варианты — отдельные файлы. Свойства одинаковые (от ClientConfig), внутреннее представление разное.
- `BlockRenderer` — единственное место, где сшиваются конфиг и компоненты.
- `lib/*` — каждая интеграция в своём файле. Лёгко мокать, легко чинить.
- Бизнес-артефакты в `docs/ops/` — markdown-файлы, чтобы легко поддерживать и AI-генерировать.

---

## Неделя 0 — фундамент (1–2 дня)

### Task 1: Инициализация проекта

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `.env.example`

- [ ] **Step 1.1: Создать Next.js проект**

```bash
cd /home/ivan/renta/screed
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*"
```

Когда спросит про существующую папку (там есть `docs/`) — выбрать «Continue».

- [ ] **Step 1.2: Инициализировать git**

```bash
git init
git add .
git commit -m "chore: bootstrap next.js project"
```

- [ ] **Step 1.3: Создать `.env.example`**

```
VK_GROUP_TOKEN=
VK_GROUP_ID=
VK_OWNER_USER_ID=
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
GOOGLE_SHEETS_WEBHOOK_URL=
```

- [ ] **Step 1.4: Установить дополнительные пакеты**

```bash
npm install nodemailer
npm install -D @types/nodemailer vitest @vitejs/plugin-react jsdom
```

- [ ] **Step 1.5: Коммит**

```bash
git add .
git commit -m "chore: add deps (nodemailer, vitest)"
```

---

### Task 2: Типы клиента и первый конфиг

**Files:**
- Create: `src/types/client.ts`, `data/clients/.gitkeep`, `data/clients/test-master.json`

- [ ] **Step 2.1: Тип `ClientConfig`**

Файл `src/types/client.ts`:

```ts
export type BlockVariant<T extends string> = `${T}A` | `${T}B` | `${T}C`;

export type ClientConfig = {
  slug: string;                  // 'ivanov-moscow'
  master: {
    name: string;                // 'Иван Иванов'
    phone: string;               // '+7 (999) 123-45-67'
    city: string;                // 'Москва'
    experienceYears: number;
    photoUrl?: string;           // фото мастера, public/clients/<slug>/master.jpg
  };
  seo: {
    title: string;
    description: string;
    h1: string;
  };
  hero: {
    variant: 'HeroA' | 'HeroB' | 'HeroC';
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  services: {
    variant: 'ServicesA' | 'ServicesB';
    items: { title: string; description: string }[];
  };
  pricing: {
    variant: 'PricingA' | 'PricingB';
    items: { name: string; pricePerM2: number; unit?: string; note?: string }[];
  };
  cases: {
    variant: 'CasesA';
    items: { title: string; beforeUrl: string; afterUrl: string; description?: string }[];
  };
  reviews: {
    variant: 'ReviewsA';
    items: { author: string; text: string; rating: number }[];
  };
  metrika?: { counterId: string }; // подключаем после онбординга
};
```

- [ ] **Step 2.2: Создать тестовый конфиг**

Файл `data/clients/test-master.json` — заполнить минимальным набором (placeholder фото можно с picsum.photos):

```json
{
  "slug": "test-master",
  "master": {
    "name": "Тестовый Мастер",
    "phone": "+7 (999) 000-00-00",
    "city": "Москва",
    "experienceYears": 10
  },
  "seo": {
    "title": "Стяжка пола под ключ в Москве — Тестовый Мастер",
    "description": "Полусухая и мокрая стяжка от 450 ₽/м². Опыт 10 лет, гарантия 5 лет.",
    "h1": "Стяжка пола в Москве"
  },
  "hero": {
    "variant": "HeroA",
    "headline": "Стяжка пола под ключ в Москве",
    "subheadline": "От 450 ₽/м². Гарантия 5 лет. Замер бесплатно.",
    "ctaText": "Получить расчёт"
  },
  "services": {
    "variant": "ServicesA",
    "items": [
      { "title": "Полусухая стяжка", "description": "Механизированная укладка, готовность к ходьбе через 12 часов." },
      { "title": "Мокрая (классическая) стяжка", "description": "Цементно-песчаная смесь, армирование сеткой, 7–14 дней набор прочности." },
      { "title": "Стяжка с теплым полом", "description": "Заливка поверх водяного или электрического контура, контроль уклонов." }
    ]
  },
  "pricing": {
    "variant": "PricingA",
    "items": [
      { "name": "Полусухая стяжка от 50 мм", "pricePerM2": 450, "unit": "м²" },
      { "name": "Мокрая стяжка от 50 мм", "pricePerM2": 600, "unit": "м²" },
      { "name": "Стяжка поверх теплого пола", "pricePerM2": 750, "unit": "м²", "note": "от" }
    ]
  },
  "cases": {
    "variant": "CasesA",
    "items": [
      {
        "title": "Квартира 75 м² в ЖК Хорошёвский",
        "beforeUrl": "https://picsum.photos/seed/before1/600/400",
        "afterUrl": "https://picsum.photos/seed/after1/600/400",
        "description": "Полусухая стяжка 60 мм, 1 день работы, 14 дней до укладки финиша."
      }
    ]
  },
  "reviews": {
    "variant": "ReviewsA",
    "items": [
      { "author": "Анна, ЖК Хорошёвский", "text": "Залили за день, ровно по уровню. Через две недели легла плитка без проблем.", "rating": 5 }
    ]
  }
}
```

- [ ] **Step 2.3: Коммит**

```bash
git add src/types data/clients
git commit -m "feat: client config type and test fixture"
```

---

### Task 3: Загрузчик конфигов

**Files:**
- Create: `src/lib/clients.ts`, `tests/lib/clients.test.ts`

- [ ] **Step 3.1: Тест загрузки**

Файл `tests/lib/clients.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadClient, listClientSlugs } from '@/src/lib/clients';

describe('clients', () => {
  it('loads test-master config', async () => {
    const client = await loadClient('test-master');
    expect(client.master.name).toBe('Тестовый Мастер');
    expect(client.hero.variant).toBe('HeroA');
  });

  it('throws on missing client', async () => {
    await expect(loadClient('does-not-exist')).rejects.toThrow();
  });

  it('lists all available slugs', async () => {
    const slugs = await listClientSlugs();
    expect(slugs).toContain('test-master');
  });
});
```

- [ ] **Step 3.2: Конфиг vitest**

Файл `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: { environment: 'node' },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

- [ ] **Step 3.3: Запустить тест — должен упасть**

```bash
npx vitest run tests/lib/clients.test.ts
```

Ожидаемо: FAIL "Cannot find module".

- [ ] **Step 3.4: Реализация**

Файл `src/lib/clients.ts`:

```ts
import { promises as fs } from 'fs';
import path from 'path';
import { ClientConfig } from '@/src/types/client';

const CLIENTS_DIR = path.join(process.cwd(), 'data', 'clients');

export async function loadClient(slug: string): Promise<ClientConfig> {
  const file = path.join(CLIENTS_DIR, `${slug}.json`);
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw) as ClientConfig;
}

export async function listClientSlugs(): Promise<string[]> {
  const files = await fs.readdir(CLIENTS_DIR);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}
```

- [ ] **Step 3.5: Прогнать тест — должен пройти**

```bash
npx vitest run tests/lib/clients.test.ts
```

Ожидаемо: 3 passed.

- [ ] **Step 3.6: Коммит**

```bash
git add src/lib tests vitest.config.ts
git commit -m "feat: client config loader with tests"
```

---

## Неделя 1 — шаблон лендинга и форма

### Task 4: Базовый блок — Hero (3 варианта)

**Files:**
- Create: `src/components/blocks/Hero/HeroA.tsx`, `HeroB.tsx`, `HeroC.tsx`

- [ ] **Step 4.1: HeroA — фото-фон + заголовок + CTA**

```tsx
// src/components/blocks/Hero/HeroA.tsx
import { ClientConfig } from '@/src/types/client';

export default function HeroA({ client }: { client: ClientConfig }) {
  return (
    <section className="relative min-h-[80vh] flex items-center bg-gray-900 text-white">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hero/1600/900')] bg-cover bg-center opacity-40" />
      <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">{client.hero.headline}</h1>
        <p className="text-xl mb-8 opacity-90">{client.hero.subheadline}</p>
        <a href="#form" className="inline-block bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-lg text-lg font-semibold">
          {client.hero.ctaText}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.2: HeroB — split-layout, фото справа**

```tsx
// src/components/blocks/Hero/HeroB.tsx
import { ClientConfig } from '@/src/types/client';

export default function HeroB({ client }: { client: ClientConfig }) {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{client.hero.headline}</h1>
          <p className="text-xl mb-8 text-gray-700">{client.hero.subheadline}</p>
          <a href="#form" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold">
            {client.hero.ctaText}
          </a>
        </div>
        <img src="https://picsum.photos/seed/hero-b/600/500" alt="" className="rounded-lg shadow-xl" />
      </div>
    </section>
  );
}
```

- [ ] **Step 4.3: HeroC — минимализм, центрированный текст без фото**

```tsx
// src/components/blocks/Hero/HeroC.tsx
import { ClientConfig } from '@/src/types/client';

export default function HeroC({ client }: { client: ClientConfig }) {
  return (
    <section className="bg-gradient-to-br from-orange-50 to-white py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm uppercase tracking-wider text-orange-600 mb-4">
          {client.master.city} · опыт {client.master.experienceYears} лет
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">{client.hero.headline}</h1>
        <p className="text-xl mb-10 text-gray-700">{client.hero.subheadline}</p>
        <a href="#form" className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-lg text-lg font-semibold">
          {client.hero.ctaText}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.4: Коммит**

```bash
git add src/components/blocks/Hero
git commit -m "feat: hero block A/B/C variants"
```

---

### Task 5: Остальные блоки (минимум по 1–2 варианта)

**Files:**
- Create: `Services/ServicesA.tsx`, `Services/ServicesB.tsx`, `Pricing/PricingA.tsx`, `Pricing/PricingB.tsx`, `Cases/CasesA.tsx`, `Reviews/ReviewsA.tsx`, `Form/LeadForm.tsx`

- [ ] **Step 5.1: ServicesA (карточки в сетке)**

```tsx
// src/components/blocks/Services/ServicesA.tsx
import { ClientConfig } from '@/src/types/client';

export default function ServicesA({ client }: { client: ClientConfig }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Услуги</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {client.services.items.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-gray-700">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.2: ServicesB (горизонтальный список с иконками-номерами)**

```tsx
// src/components/blocks/Services/ServicesB.tsx
import { ClientConfig } from '@/src/types/client';

export default function ServicesB({ client }: { client: ClientConfig }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12">Что делаем</h2>
        <div className="space-y-8">
          {client.services.items.map((s, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-700">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.3: PricingA (таблица)**

```tsx
// src/components/blocks/Pricing/PricingA.tsx
import { ClientConfig } from '@/src/types/client';

export default function PricingA({ client }: { client: ClientConfig }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Цены</h2>
        <table className="w-full">
          <tbody>
            {client.pricing.items.map((p, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-4 font-medium">{p.name}</td>
                <td className="py-4 text-right text-orange-600 font-semibold">
                  {p.note ?? ''} {p.pricePerM2.toLocaleString('ru-RU')} ₽/{p.unit ?? 'м²'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.4: PricingB (карточки)**

```tsx
// src/components/blocks/Pricing/PricingB.tsx
import { ClientConfig } from '@/src/types/client';

export default function PricingB({ client }: { client: ClientConfig }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Прайс</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {client.pricing.items.map((p, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">{p.name}</p>
              <p className="text-3xl font-bold text-gray-900">
                {p.note ?? ''} {p.pricePerM2.toLocaleString('ru-RU')}
                <span className="text-lg text-gray-500 font-normal"> ₽/{p.unit ?? 'м²'}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.5: CasesA (фото до/после)**

```tsx
// src/components/blocks/Cases/CasesA.tsx
import { ClientConfig } from '@/src/types/client';

export default function CasesA({ client }: { client: ClientConfig }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Наши работы</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {client.cases.items.map((c, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <img src={c.beforeUrl} alt="до" className="rounded" />
                  <p className="text-sm text-gray-600 mt-1">До</p>
                </div>
                <div>
                  <img src={c.afterUrl} alt="после" className="rounded" />
                  <p className="text-sm text-gray-600 mt-1">После</p>
                </div>
              </div>
              {c.description && <p className="text-gray-700">{c.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.6: ReviewsA**

```tsx
// src/components/blocks/Reviews/ReviewsA.tsx
import { ClientConfig } from '@/src/types/client';

export default function ReviewsA({ client }: { client: ClientConfig }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Отзывы</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {client.reviews.items.map((r, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-orange-500 mb-3">{'★'.repeat(r.rating)}</div>
              <p className="text-gray-700 mb-4">«{r.text}»</p>
              <p className="text-sm text-gray-600 font-medium">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.7: LeadForm (client component)**

```tsx
// src/components/blocks/Form/LeadForm.tsx
'use client';
import { useState } from 'react';
import { ClientConfig } from '@/src/types/client';

export default function LeadForm({ client }: { client: ClientConfig }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientSlug: client.slug, phone, name, comment }),
      });
      if (!res.ok) throw new Error('failed');
      const counterId = client.metrika?.counterId;
      if (counterId && typeof window !== 'undefined' && (window as any).ym) {
        (window as any).ym(Number(counterId), 'reachGoal', 'lead_form_submit');
      }
      setStatus('ok');
      setPhone(''); setName(''); setComment('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="form" className="py-20 bg-orange-500 text-white">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Получить расчёт за 5 минут</h2>
        <p className="mb-8 opacity-90">Перезвоним и бесплатно рассчитаем стоимость работ.</p>
        {status === 'ok' ? (
          <p className="text-xl">Спасибо! Перезвоним в течение часа.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input required placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded text-gray-900" />
            <input required type="tel" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded text-gray-900" />
            <textarea placeholder="Комментарий (необязательно)" value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 rounded text-gray-900" rows={3} />
            <button type="submit" disabled={status === 'sending'}
              className="w-full bg-gray-900 hover:bg-black py-4 rounded font-semibold disabled:opacity-50">
              {status === 'sending' ? 'Отправляем…' : 'Получить расчёт'}
            </button>
            {status === 'error' && <p className="text-sm">Не удалось отправить, попробуйте ещё раз или позвоните: {client.master.phone}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5.8: Коммит**

```bash
git add src/components/blocks
git commit -m "feat: services, pricing, cases, reviews, form blocks"
```

---

### Task 6: BlockRenderer и динамический роут

**Files:**
- Create: `src/components/BlockRenderer.tsx`, `app/[clientSlug]/page.tsx`, `app/[clientSlug]/layout.tsx`

- [ ] **Step 6.1: BlockRenderer**

```tsx
// src/components/BlockRenderer.tsx
import { ClientConfig } from '@/src/types/client';
import HeroA from './blocks/Hero/HeroA';
import HeroB from './blocks/Hero/HeroB';
import HeroC from './blocks/Hero/HeroC';
import ServicesA from './blocks/Services/ServicesA';
import ServicesB from './blocks/Services/ServicesB';
import PricingA from './blocks/Pricing/PricingA';
import PricingB from './blocks/Pricing/PricingB';
import CasesA from './blocks/Cases/CasesA';
import ReviewsA from './blocks/Reviews/ReviewsA';
import LeadForm from './blocks/Form/LeadForm';

const HERO = { HeroA, HeroB, HeroC };
const SERVICES = { ServicesA, ServicesB };
const PRICING = { PricingA, PricingB };

export default function BlockRenderer({ client }: { client: ClientConfig }) {
  const Hero = HERO[client.hero.variant];
  const Services = SERVICES[client.services.variant];
  const Pricing = PRICING[client.pricing.variant];
  return (
    <>
      <Hero client={client} />
      <Services client={client} />
      <Pricing client={client} />
      <CasesA client={client} />
      <ReviewsA client={client} />
      <LeadForm client={client} />
    </>
  );
}
```

- [ ] **Step 6.2: Дин. layout с SEO и Метрикой**

```tsx
// app/[clientSlug]/layout.tsx
import Script from 'next/script';
import { loadClient } from '@/src/lib/clients';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { clientSlug: string } }): Promise<Metadata> {
  const client = await loadClient(params.clientSlug);
  return {
    title: client.seo.title,
    description: client.seo.description,
  };
}

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientSlug: string };
}) {
  const client = await loadClient(params.clientSlug);
  const counterId = client.metrika?.counterId;
  return (
    <>
      {counterId && (
        <Script id={`ym-${counterId}`} strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
          ym(${counterId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
        </Script>
      )}
      {children}
    </>
  );
}
```

Метрика подключится автоматически, когда в JSON клиента появится `metrika.counterId`. До этого момента — просто не вставляется скрипт.

- [ ] **Step 6.3: Дин. страница**

```tsx
// app/[clientSlug]/page.tsx
import { loadClient, listClientSlugs } from '@/src/lib/clients';
import BlockRenderer from '@/src/components/BlockRenderer';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const slugs = await listClientSlugs();
  return slugs.map((clientSlug) => ({ clientSlug }));
}

export default async function ClientPage({ params }: { params: { clientSlug: string } }) {
  try {
    const client = await loadClient(params.clientSlug);
    return <BlockRenderer client={client} />;
  } catch {
    notFound();
  }
}
```

- [ ] **Step 6.4: Запуск dev и визуальная проверка**

```bash
npm run dev
```

Открыть `http://localhost:3000/test-master`. Должен видно: Hero (вариант A), Services, Pricing, Cases, Reviews, Form. Все блоки заполнены данными из JSON.

- [ ] **Step 6.5: Поменять варианты в JSON и перепроверить**

В `data/clients/test-master.json`: `hero.variant` → `HeroB`, `services.variant` → `ServicesB`, `pricing.variant` → `PricingB`. Перезагрузить — должны меняться макеты блоков.

Вернуть как было после проверки.

- [ ] **Step 6.6: Коммит**

```bash
git add src/components/BlockRenderer.tsx app/[clientSlug]
git commit -m "feat: dynamic client route with block renderer"
```

---

### Task 7: Интеграция VK — отправка сообщения о новой заявке

**Files:**
- Create: `src/lib/vk.ts`, `tests/lib/vk.test.ts`
- Read: `docs/ops/vk-setup.md` (создаётся в этой задаче)

**Контекст для исполнителя:** будем отправлять сообщения от имени группы-сообщества основателя в его личку (или в беседу). Это бесплатно и не требует одобрения VK.

- [ ] **Step 7.1: Сетап VK Community (вне кода)**

Создать инструкцию в `docs/ops/vk-setup.md`:

```md
# Настройка VK для приёма заявок

1. Создать новое сообщество (любое название, тип «Бизнес»).
2. Зайти в Управление → Работа с API → Ключи доступа → Создать ключ.
3. Дать права: «Сообщения сообщества», «Сообщения», «Управление сообществом».
4. Скопировать токен в `.env.local` как `VK_GROUP_TOKEN`.
5. ID сообщества: Управление → Адрес страницы (или использовать число из URL без минуса). Записать в `VK_GROUP_ID`.
6. Включить в сообществе: Управление → Сообщения → Сообщения сообщества (вкл).
7. Узнать свой `user_id` (свой VK ID числом, например через vk.com/id123456). Записать в `VK_OWNER_USER_ID`.
8. **Один раз вручную написать сообщению группы** "+", чтобы группа смогла писать в ответ. Без этого VK блокирует исходящие.
```

- [ ] **Step 7.2: Тест отправки**

```ts
// tests/lib/vk.test.ts
import { describe, it, expect, vi } from 'vitest';
import { sendVkMessage } from '@/src/lib/vk';

global.fetch = vi.fn(async () =>
  ({ ok: true, json: async () => ({ response: 1 }) } as Response)
);

describe('vk', () => {
  it('sends message via VK API', async () => {
    process.env.VK_GROUP_TOKEN = 'tok';
    process.env.VK_OWNER_USER_ID = '111';
    await sendVkMessage('hello');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.vk.com/method/messages.send'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws when VK API returns error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ error: { error_msg: 'nope' } }) });
    process.env.VK_GROUP_TOKEN = 'tok';
    process.env.VK_OWNER_USER_ID = '111';
    await expect(sendVkMessage('x')).rejects.toThrow('VK API error: nope');
  });
});
```

- [ ] **Step 7.3: Запустить тест — упадёт**

```bash
npx vitest run tests/lib/vk.test.ts
```

- [ ] **Step 7.4: Реализация**

```ts
// src/lib/vk.ts
const VK_API_VERSION = '5.199';

export async function sendVkMessage(text: string): Promise<void> {
  const token = process.env.VK_GROUP_TOKEN;
  const userId = process.env.VK_OWNER_USER_ID;
  if (!token || !userId) throw new Error('VK env vars not set');

  const url = new URL('https://api.vk.com/method/messages.send');
  url.searchParams.set('user_id', userId);
  url.searchParams.set('message', text);
  url.searchParams.set('random_id', String(Date.now()));
  url.searchParams.set('access_token', token);
  url.searchParams.set('v', VK_API_VERSION);

  const res = await fetch(url.toString(), { method: 'POST' });
  const data = await res.json();
  if (data.error) throw new Error(`VK API error: ${data.error.error_msg}`);
}
```

- [ ] **Step 7.5: Тест проходит**

```bash
npx vitest run tests/lib/vk.test.ts
```

- [ ] **Step 7.6: Коммит**

```bash
git add src/lib/vk.ts tests/lib/vk.test.ts docs/ops/vk-setup.md
git commit -m "feat: vk message sender + setup docs"
```

---

### Task 8: Интеграция SMTP

**Files:**
- Create: `src/lib/email.ts`, `tests/lib/email.test.ts`

- [ ] **Step 8.1: Тест**

```ts
// tests/lib/email.test.ts
import { describe, it, expect, vi } from 'vitest';

const sendMail = vi.fn();
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail }) },
}));

import { sendLeadEmail } from '@/src/lib/email';

describe('email', () => {
  it('sends email with subject and html', async () => {
    process.env.SMTP_HOST = 'h'; process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'u'; process.env.SMTP_PASS = 'p';
    process.env.SMTP_FROM = 'from@x'; process.env.SMTP_TO = 'to@x';
    await sendLeadEmail({ subject: 'Заявка', html: '<b>hi</b>' });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'from@x', to: 'to@x', subject: 'Заявка', html: '<b>hi</b>',
    }));
  });
});
```

- [ ] **Step 8.2: Реализация**

```ts
// src/lib/email.ts
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;
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

export async function sendLeadEmail({ subject, html }: { subject: string; html: string }) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM!,
    to: process.env.SMTP_TO!,
    subject,
    html,
  });
}
```

Добавить в `.env.example`:

```
SMTP_TO=
```

- [ ] **Step 8.3: Тест проходит**

```bash
npx vitest run tests/lib/email.test.ts
```

- [ ] **Step 8.4: Коммит**

```bash
git add src/lib/email.ts tests/lib/email.test.ts .env.example
git commit -m "feat: smtp email sender"
```

---

### Task 9: Google Sheets webhook

**Files:**
- Create: `src/lib/sheets.ts`, `tests/lib/sheets.test.ts`, `docs/ops/sheets-setup.md`

- [ ] **Step 9.1: Инструкция настройки Apps Script**

`docs/ops/sheets-setup.md`:

```md
# Google Sheets как лог заявок

1. Создать Google Spreadsheet, листы: `Leads` (колонки: timestamp, slug, name, phone, comment, status), `Masters`, `Subscriptions`.
2. Расширения → Apps Script. Вставить:

\```js
const SHEET_ID = '<вставить ID таблицы>';
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Leads');
  sheet.appendRow([
    new Date(),
    data.slug || '',
    data.name || '',
    data.phone || '',
    data.comment || '',
    'new'
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
\```

3. Развернуть → Веб-приложение → Доступ: «Все, у кого есть ссылка». Скопировать URL в `GOOGLE_SHEETS_WEBHOOK_URL`.
4. Проверить: `curl -X POST <URL> -d '{"name":"test","phone":"+7","slug":"test"}'` → должна появиться строка.
```

- [ ] **Step 9.2: Тест и реализация**

```ts
// tests/lib/sheets.test.ts
import { describe, it, expect, vi } from 'vitest';
import { logLeadToSheet } from '@/src/lib/sheets';

describe('sheets', () => {
  it('posts JSON to webhook', async () => {
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = 'https://x';
    global.fetch = vi.fn(async () => ({ ok: true } as Response));
    await logLeadToSheet({ slug: 's', name: 'n', phone: 'p', comment: 'c' });
    expect(fetch).toHaveBeenCalledWith('https://x', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"name":"n"'),
    }));
  });
});
```

```ts
// src/lib/sheets.ts
export async function logLeadToSheet(data: {
  slug: string; name: string; phone: string; comment?: string;
}): Promise<void> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) throw new Error('GOOGLE_SHEETS_WEBHOOK_URL not set');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Sheets webhook failed: ${res.status}`);
}
```

- [ ] **Step 9.3: Прогнать тест и закоммитить**

```bash
npx vitest run tests/lib/sheets.test.ts
git add src/lib/sheets.ts tests/lib/sheets.test.ts docs/ops/sheets-setup.md
git commit -m "feat: google sheets webhook logger"
```

---

### Task 10: API endpoint /api/lead

**Files:**
- Create: `app/api/lead/route.ts`, `tests/api/lead.test.ts`

- [ ] **Step 10.1: Тест воронки**

```ts
// tests/api/lead.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendVkMessage = vi.fn();
const sendLeadEmail = vi.fn();
const logLeadToSheet = vi.fn();

vi.mock('@/src/lib/vk', () => ({ sendVkMessage }));
vi.mock('@/src/lib/email', () => ({ sendLeadEmail }));
vi.mock('@/src/lib/sheets', () => ({ logLeadToSheet }));
vi.mock('@/src/lib/clients', () => ({
  loadClient: vi.fn(async () => ({
    slug: 'x', master: { name: 'M', phone: '+7', city: 'C', experienceYears: 1 },
  })),
}));

import { POST } from '@/app/api/lead/route';

describe('POST /api/lead', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on missing phone', async () => {
    const req = new Request('http://x', { method: 'POST', body: JSON.stringify({ clientSlug: 'x', name: 'a' }) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('fans out to vk, email, sheet on valid lead', async () => {
    const req = new Request('http://x', { method: 'POST', body: JSON.stringify({
      clientSlug: 'x', name: 'Иван', phone: '+79991112233', comment: 'asap'
    }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(sendVkMessage).toHaveBeenCalledOnce();
    expect(sendLeadEmail).toHaveBeenCalledOnce();
    expect(logLeadToSheet).toHaveBeenCalledOnce();
  });

  it('returns 200 even if one channel fails (does not lose lead)', async () => {
    sendVkMessage.mockRejectedValueOnce(new Error('vk down'));
    const req = new Request('http://x', { method: 'POST', body: JSON.stringify({
      clientSlug: 'x', name: 'a', phone: '+7'
    }) });
    const res = await POST(req);
    expect(res.status).toBe(200); // лид всё равно записан в sheet/email
    expect(logLeadToSheet).toHaveBeenCalled();
  });
});
```

- [ ] **Step 10.2: Реализация**

```ts
// app/api/lead/route.ts
import { NextResponse } from 'next/server';
import { loadClient } from '@/src/lib/clients';
import { sendVkMessage } from '@/src/lib/vk';
import { sendLeadEmail } from '@/src/lib/email';
import { logLeadToSheet } from '@/src/lib/sheets';

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const { clientSlug, name, phone, comment } = body ?? {};
  if (!clientSlug || !phone) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  let client;
  try { client = await loadClient(clientSlug); }
  catch { return NextResponse.json({ error: 'unknown client' }, { status: 404 }); }

  const text = [
    `Новая заявка для ${client.master.name} (${clientSlug})`,
    `Имя: ${name ?? '—'}`,
    `Телефон: ${phone}`,
    comment && `Комментарий: ${comment}`,
    `Город: ${client.master.city}`,
  ].filter(Boolean).join('\n');

  const html = text.replace(/\n/g, '<br>');

  // Все три канала — параллельно, не теряем лид если один упал
  await Promise.allSettled([
    sendVkMessage(text),
    sendLeadEmail({ subject: `Заявка: ${client.master.name}`, html }),
    logLeadToSheet({ slug: clientSlug, name, phone, comment }),
  ]);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 10.3: Прогнать тесты**

```bash
npx vitest run
```

Все три тест-файла должны пройти.

- [ ] **Step 10.4: Коммит**

```bash
git add app/api tests/api
git commit -m "feat: lead endpoint with vk+email+sheet fanout"
```

---

### Task 11: E2E проверка локально

**Files:** не создаём, проверяем вручную

- [ ] **Step 11.1: Заполнить `.env.local` реальными значениями**

VK токен/ID, SMTP креды Яндекс 360, Google Sheets webhook.

- [ ] **Step 11.2: `npm run dev`, открыть `localhost:3000/test-master`**

- [ ] **Step 11.3: Заполнить и отправить форму**

Имя «Тест», телефон «+79991112233», комментарий «проверка».

- [ ] **Step 11.4: Убедиться, что заявка пришла во все три канала**

- [ ] VK сообщение в личку основателя
- [ ] Email на `SMTP_TO`
- [ ] Строка в Google Sheet листе `Leads`

- [ ] **Step 11.5: Если что-то не пришло — отладить, описать в `docs/ops/troubleshooting.md`**

---

## Неделя 2 — деплой и пилот №1

### Task 12: Деплой на Vercel

**Files:**
- Create: `docs/ops/vercel-deploy.md`

- [ ] **Step 12.1: Создать аккаунт Vercel, привязать GitHub**

- [ ] **Step 12.2: Импортировать проект**

```bash
npm install -g vercel
vercel login
vercel
```

- [ ] **Step 12.3: Прокинуть env vars в Vercel UI**

Settings → Environment Variables: все переменные из `.env.local`.

- [ ] **Step 12.4: Production deploy**

```bash
vercel --prod
```

- [ ] **Step 12.5: Открыть `<deploy>.vercel.app/test-master` — проверить**

- [ ] **Step 12.6: Записать процесс в `docs/ops/vercel-deploy.md`**

---

### Task 13: AI-промпт для генерации `<slug>.json`

**Files:**
- Create: `docs/ops/ai-prompt-client-config.md`

- [ ] **Step 13.1: Шаблон промпта**

```md
# AI-промпт: генерация клиентского JSON

Дай Claude/GPT следующий вход:

---

Ты — генератор JSON-конфигов для шаблона лендинга штукатура.

Входные данные о мастере:
- Имя: {Имя Фамилия}
- Город: {Город}
- Опыт: {N лет}
- Услуги (со слов мастера): {текст}
- Цены (со слов мастера): {текст}
- Кейсы (фото/описания): {URL фото и комментарии}
- Отзывы клиентов: {текст}
- Особенность мастера: {например, "работаю только с премиум-материалами" или "только машинная штукатурка"}

Тебе нужно сгенерировать валидный JSON по схеме `ClientConfig` (см. `src/types/client.ts`).

Требования к уникальности:
1. Подбери variant блоков **разные** от ранее использованных (передам список в конце).
2. Заголовки и описания услуг — **переформулируй своими словами** на основе ввода. Не повторяй формулировки из других клиентов.
3. SEO title/description: включи город и УТП мастера, длина title 50-65 символов.
4. CTA-кнопка: подбери глагол под характер мастера ("узнать стоимость", "получить расчёт", "записаться на замер").

Ранее использованные варианты блоков для города {Город}:
- HeroA: ivanov-moscow
- ServicesB: ivanov-moscow
- (и т.д.)

Верни только JSON без пояснений.
```

- [ ] **Step 13.2: Коммит**

```bash
git add docs/ops/ai-prompt-client-config.md
git commit -m "docs: ai prompt for generating client config"
```

---

### Task 14: Бизнес-артефакты — договор, чек-лист, скрипт

**Files:**
- Create: `docs/ops/contract-template.md`, `docs/ops/master-onboarding-checklist.md`, `docs/ops/avito-cold-outreach-script.md`, `docs/ops/weekly-report-template.md`

- [ ] **Step 14.1: Шаблон договора**

`docs/ops/contract-template.md`:

```md
# Договор оказания услуг (упрощённый, 1 страница)

**Стороны:**
- Исполнитель: {ИП/Самозанятый} {ФИО}, ИНН {…}
- Заказчик: {ФИО мастера}, контакт {…}

**Предмет:**
Исполнитель предоставляет Заказчику пакет услуг «Лендинг + ведение РК»:
- Лендинг на поддомене Исполнителя.
- Размещение и ведение Яндекс.Директ кампании.
- Доставка заявок Заказчику в VK/email.
- Еженедельный отчёт по расходам и заявкам.

**Что НЕ входит:** рекламный бюджет, оплачивается Заказчиком отдельно (мин. 15 000 ₽/мес на счёт рекламного кабинета Исполнителя).

**Стоимость:** 15 000 ₽/мес. Предоплата 1-го числа.

**Эксклюзив:** Исполнитель гарантирует, что в связке «штукатурка + {Город}» одновременно ведётся реклама не более чем на одного Заказчика.

**Право собственности:** Лендинг, рекламный кабинет, креативы — собственность Исполнителя. По истечении 6 мес. подписки Заказчик вправе выкупить инфраструктуру за единоразовый платёж 50 000 ₽.

**Расторжение:** Любая сторона вправе расторгнуть договор уведомлением за 7 календарных дней. Текущий месяц подписки не возвращается.

**Гарантии:** Исполнитель не гарантирует конкретного количества заявок. Гарантирует отработку рекламного бюджета и техническую работоспособность лендинга.

Подписи:
___ {Дата} ___                  ___ {Дата} ___
```

- [ ] **Step 14.2: Чек-лист онбординга мастера**

`docs/ops/master-onboarding-checklist.md`:

```md
# Чек-лист онбординга мастера

## Что нужно от мастера (за 1 встречу)
- [ ] ФИО, телефон, город, опыт (лет).
- [ ] Список услуг с описанием.
- [ ] Прайс-лист (минимум 3 позиции).
- [ ] 3–5 фото работ «до/после» (можно с телефона).
- [ ] 2–3 текстовых отзыва клиентов (имя + текст).
- [ ] Желаемое имя поддомена (или предложить shop-{name}.master.ru).
- [ ] Особенность мастера / УТП — одно-два предложения.

## Что делает Исполнитель в первый день
- [ ] Сгенерировать `<slug>.json` через AI-промпт.
- [ ] Положить фото в `public/clients/<slug>/`.
- [ ] Закоммитить и задеплоить.
- [ ] Привязать поддомен в Vercel.
- [ ] Создать счётчик Яндекс.Метрики, добавить в JSON.
- [ ] Открыть страницу, проверить визуал.
- [ ] Создать кампанию Яндекс.Директ (см. чек-лист РК).
- [ ] Сделать тестовую заявку через форму, проверить доставку.
- [ ] Подписать договор.
- [ ] Создать строку в листе `Masters` Google-таблицы.

## SLA первого месяца
- [ ] Запуск кампании в течение 48 часов после получения данных.
- [ ] Еженедельный отчёт каждую пятницу.
- [ ] Ответ на сообщения мастера в течение 4 часов в рабочее время.
```

- [ ] **Step 14.3: Скрипт холодного обхода Avito**

`docs/ops/avito-cold-outreach-script.md`:

```md
# Скрипт холодного обхода Avito (для Недели 3 и далее)

## Где искать
Avito → Услуги → Ремонт и стройка → Штукатурка/Отделочные работы → фильтр «Частный мастер».

## Цель в день
30 сообщений в день, ~10–15 диалогов в неделю, 1–2 встречи.

## Текст первого сообщения

> Здравствуйте, {Имя}! Меня зовут {Ваше имя}, я делаю частным мастерам штукатурам персональные сайты с рекламой Яндекс.Директ под ключ — мастера получают заявки напрямую, без комиссий Авито/Профи.
>
> Сейчас работает мой пилот — мастер из {Город}, за первые 2 недели — {N} заявок при бюджете 15к. Ссылка на кейс: {url}
>
> Подписка 15к/мес + рекламный бюджет отдельно. Эксклюзив на ваш город — конкуренты по моему сервису туда не зайдут.
>
> Если интересно — могу созвониться 15 минут, расскажу детально. Удобно сегодня вечером или завтра до обеда?

## Ответы на возражения

**«У меня уже есть Авито/Профи».** → Это лидген. Я делаю вам ваш бренд, ваш сайт, без комиссий с заказа. Лиды напрямую вам, минус Авито = +20–30% к доходу с того же объёма работы.

**«Дорого 30к на старте».** → Тестовый период 2 недели бесплатно: я подключаю всё, вы получаете заявки. Если в эти 2 недели не зашло — расходимся без обязательств.

**«А если я уйду?»** → По договору после 6 мес. подписки можете выкупить инфраструктуру за 50к и забрать кабинет себе. До этого — пользуетесь.

## Что НЕ говорить
- Не обещать N заявок. Только «бюджет отрабатывается, заявки приходят, средний CPL по нише ~500–800 ₽».
- Не сравнивать впрямую "мы лучше Профи".
```

- [ ] **Step 14.4: Шаблон еженедельного отчёта**

`docs/ops/weekly-report-template.md`:

```md
# Шаблон еженедельного отчёта мастеру

Отправляется каждую пятницу в VK мастеру.

---

Привет, {Имя}!

Отчёт за неделю {DD.MM} – {DD.MM}:

📊 **Цифры**
- Заявок получено: {N} (из них валидных: {M})
- Расход рекламы: {X} ₽
- CPL: {Y} ₽
- Остаток на кабинете: {Z} ₽

📞 **Заявки** (из Google-таблицы):
1. {Дата} — {Имя клиента}, {телефон}, {комментарий}
2. ...

💡 **Что сделал на этой неделе:**
- Откорректировал ставки по {N} ключам.
- Добавил {N} минус-слов.
- {Опционально: что-то ещё}

📌 **Что планирую на следующую неделю:**
- {1–2 пункта}

❓ **Вопрос к тебе:**
- {Уточнить статус 2–3 заявок: «дозвонился до Анны (+7..)? сколько вышло сделок за неделю?»}

Если есть вопросы — пиши, на связи.
```

- [ ] **Step 14.5: Коммит**

```bash
git add docs/ops
git commit -m "docs: contract, onboarding, avito script, weekly report"
```

---

### Task 15: Custdev пилотного мастера №1

**Файлы:** не создаём, операционка.

- [ ] **Step 15.1: Список из 5–10 знакомых штукатуров (личная сеть основателя)**

Записать в `docs/ops/pilot-prospects.md` (не коммитим в публичный репо — добавить в `.gitignore`).

- [ ] **Step 15.2: Связаться с 3 — оффер «2 недели бесплатно за фото и отзыв»**

- [ ] **Step 15.3: Согласие первого мастера**

- [ ] **Step 15.4: Получить данные по чек-листу (Task 14.2)**

- [ ] **Step 15.5: Сгенерировать `data/clients/<slug>.json` через AI-промпт**

- [ ] **Step 15.6: Загрузить фото в `public/clients/<slug>/`**

- [ ] **Step 15.7: Прогнать локально → задеплоить**

```bash
npm run dev      # локальная проверка
git add data public
git commit -m "feat: launch pilot 1 — <slug>"
git push         # триггерит деплой
```

- [ ] **Step 15.8: Привязать поддомен в Vercel**

В Vercel → Project → Domains → Add: `<slug>.<основной-домен>` (или временно `slug-renta.vercel.app`).

- [ ] **Step 15.9: Установить счётчик Метрики**

1. Создать новый счётчик в metrika.yandex.ru с адресом `<slug>.<домен>`.
2. Скопировать ID счётчика (число вида 12345678).
3. Добавить в `data/clients/<slug>.json`:
   ```json
   "metrika": { "counterId": "12345678" }
   ```
4. Создать в Метрике цель «Отправка формы» — тип «JavaScript-событие», название цели `lead_form_submit`. Форма уже зовёт `ym(counterId, 'reachGoal', 'lead_form_submit')` после успешного fetch (см. Task 5.7) — будет приходить автоматически.
5. Закоммитить и задеплоить.

- [ ] **Step 15.10: Тестовая заявка → проверка доставки**

---

### Task 16: Запуск Яндекс.Директ для пилота №1

**Files:**
- Create: `docs/ops/direct-campaign-checklist.md`

- [ ] **Step 16.1: Чек-лист настройки кампании**

`docs/ops/direct-campaign-checklist.md`:

```md
# Чек-лист настройки Яндекс.Директ кампании на мастера

## Структура аккаунта
- Один общий аккаунт (мастер-аккаунт основателя).
- Один клиент = одна кампания.
- Одна кампания = две группы: «Поиск» и «РСЯ».

## Семантика для штукатурки
- Базовые ключи: «штукатурка стен», «штукатурка цена», «штукатурка под ключ».
- Геозависимые: добавить «{Город}» через настройку гео.
- Минус-слова с первого дня: «своими руками», «как сделать», «видео», «учебник», «работа», «вакансия», «обучение», «курсы».

## Бюджет и ставки
- Старт: 500 ₽/день на поиск, 300 ₽/день на РСЯ. Итого 24 000 ₽/мес макс. — мастер пополняет хотя бы 15к.
- Стратегия: «Оптимизация конверсий по ROI» с ручным управлением ставками первые 2 недели.
- Цель в Метрике — отправка формы.

## Креативы
- 3 объявления на группу.
- Заголовок 1: УТП («Штукатурка по маякам в {Город}»).
- Заголовок 2: цена («От 350 ₽/м²»).
- Описание: гарантия, опыт, телефон.
- Быстрые ссылки: услуги / цены / отзывы / контакты.
- Уникализировать креативы под каждого мастера (см. п. 6 спеки — иначе модерация).

## После запуска
- Каждые 3 дня — чистка минус-слов, корректировка ставок.
- Ежедневно — расход не выше 1000 ₽ в первые 2 недели.
- Если 0 заявок за первую неделю — пересмотреть лендинг (а не бюджет).
```

- [ ] **Step 16.2: Создать кампанию по чек-листу**

- [ ] **Step 16.3: Запустить, ежедневно следить первые 3 дня**

- [ ] **Step 16.4: Коммит**

```bash
git add docs/ops/direct-campaign-checklist.md
git commit -m "docs: yandex direct campaign checklist"
```

---

## Неделя 3 — пилот №2

### Task 17: Custdev и запуск пилота №2

Повторить **Task 15 + Task 16** для второго мастера. Уникализировать варианты блоков и креативы.

- [ ] **Step 17.1–17.10**: см. Task 15 шаги.
- [ ] **Step 17.11**: при генерации JSON через AI — указать в промпте, какие варианты блоков уже заняты пилотом 1, выбрать другие.

---

## Неделя 4 — отчёты, gate-ы, ревью

### Task 18: Сбор метрик первого месяца

**Files:**
- Create: `docs/ops/month-1-review.md`

- [ ] **Step 18.1: Заполнить лист `Masters` в Google-таблице**

Колонки: slug, ФИО, город, дата запуска, статус (пилот/платный), MRR, бюджет РК, заявок за месяц, отзывы.

- [ ] **Step 18.2: Сделать срез метрик из спеки**

Сравнить с целевыми из спеки (раздел 8):
- CAC: для пилотов = 0 ₽ (личная сеть).
- MRR: 0 ₽ (пилоты бесплатные).
- Заявок у каждого пилота за 2 недели: целевое ≥ 5.
- CPL клиентов: целевое < 800 ₽.

- [ ] **Step 18.3: Записать ревью в `docs/ops/month-1-review.md`**

```md
# Ревью месяца 1

## Цели MVP месяца 1
- 2 пилота запущены: { yes / no, какие }
- ≥ 5 заявок у каждого за 2 недели: { yes / no, фактические числа }

## Gate-ы (из спеки, раздел 7)
- GO условие: 2 пилота + ≥ 5 заявок у каждого. Достигнуто? { … }
- STOP-1: не нашли 2 пилотов. { … }
- STOP-2: пилоты получили < 3 заявок при ≥ 10к бюджета. { … }

## Что работает / что нет
- { Список наблюдений из реальной операционки за месяц. }

## Решение
- [ ] GO → переходим к месяцу 2 (план писать отдельно).
- [ ] STOP-1 → разбираем позиционирование, custdev.
- [ ] STOP-2 → чиним лендинг/креативы.

## Что улучшить в шаблоне (тех. долг)
- {…}
```

- [ ] **Step 18.4: Коммит**

```bash
git add docs/ops/month-1-review.md
git commit -m "docs: month 1 review"
```

---

### Task 19: Решение Go/No-Go и план Месяца 2

**Files:** не создаём, человеческое решение.

- [ ] **Step 19.1: Прочитать `docs/ops/month-1-review.md` свежим взглядом**

- [ ] **Step 19.2: Принять решение по gate-у**

- [ ] **Step 19.3: Зарегистрировать ИП или самозанятого до первой платной подписки**

В договоре (Task 14.1) Исполнитель указан как ИП/Самозанятый. До первого платежа от мастера — оформить статус, открыть р/с, добавить реквизиты в шаблон договора. Самый быстрый путь: самозанятый через приложение «Мой налог», 1 день, без открытия р/с (приём через СБП или карту). ИП — 3–5 дней, нужен для договоров с юрлицами (на этапе пилотов с физ. мастерами не обязателен).

- [ ] **Step 19.4: Если GO — запустить написание плана Месяца 2**

```bash
# В новой Claude-сессии:
# /skills writing-plans
# Контекст: спека + план месяца 1 + ревью
```

- [ ] **Step 19.5: Если STOP — определить, что меняем (ниша/лендинг/оффер) и переписать спеку**

---

## Сводка по артефактам, которые появляются за Месяц 1

**Кодовая база:**
- 1 Next.js проект на Vercel.
- 6 типов блоков, 9 вариантов всего (Hero × 3, Services × 2, Pricing × 2, Cases × 1, Reviews × 1) + Form.
- API `/api/lead` с фан-аутом в VK + email + Sheet.
- Покрытие тестами: clients loader, vk, email, sheet, lead endpoint.

**Бизнес-артефакты в `docs/ops/`:**
- `vk-setup.md`
- `sheets-setup.md`
- `vercel-deploy.md`
- `ai-prompt-client-config.md`
- `contract-template.md`
- `master-onboarding-checklist.md`
- `avito-cold-outreach-script.md`
- `weekly-report-template.md`
- `direct-campaign-checklist.md`
- `troubleshooting.md` (по факту проблем)
- `month-1-review.md`

**Внешние аккаунты, которые должны быть подняты:**
- VK сообщество основателя.
- Яндекс 360 для SMTP.
- Google Spreadsheet с Apps Script webhook.
- Vercel.
- GitHub (репозиторий проекта).
- Яндекс.Метрика (счётчики на каждого клиента).
- Яндекс.Директ (мастер-аккаунт).
- ИП/самозанятый с возможностью принимать оплату от мастера.

**KPI к концу месяца 1 (целевые):**
- 2 запущенных лендинга на поддоменах.
- 2 активных РК Директа.
- ≥ 10 валидных заявок суммарно (≥ 5 на каждого пилота).
- 0 ушедших по причине «реклама не работает».
- 0 ₽ MRR (пилоты бесплатные) → ожидается рост до 30к в Месяц 2.
