# Дизайн одиночного лендинга для частного мастера по стяжке пола

Дата: 2026-04-25
Статус: согласован, готов к написанию плана
Связанные документы:
- `2026-04-25-screed-saas-design.md` — мульти-арендный SaaS-сервис (отложен; этот лендинг — первый шаг к нему).
- План реализации — будет создан следующим шагом через skill `superpowers:writing-plans`.

---

## 1. Цель проекта

Один публичный лендинг под услугу «стяжка пола под ключ» для одного частного мастера. Деплой на Vercel. Цель — собирать тёплые заявки (имя/телефон + параметры объекта) и доставлять мастеру в реальном времени.

Контент на старте — заглушки (тексты, фото, отзывы). Имя мастера, телефон, цены, цвета — вынесены в редактируемый конфиг и подменяются без правки кода.

Этот лендинг — самостоятельный продукт. Когда понадобится мульти-арендность (см. spec мульти-арендного SaaS), код можно будет обобщить, но сейчас не оптимизируем под это.

## 2. Стек

| Слой | Выбор |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| Стилизация | Tailwind CSS (все стили inline-классами; глобальный CSS только `index.css` с `@tailwind` директивами и base-reset) |
| SSG | `vite-ssg` — пререндер `dist/index.html` на сборке, отдаёт HTML с готовым контентом |
| Формы | `react-hook-form` + `zod` (одна schema-библиотека, общая между клиентом и `/api/lead`) |
| Условные классы | `clsx` |
| Варианты примитивов | `class-variance-authority` (cva) — внутри тех же файлов компонентов |
| Backend | Vercel Serverless Functions (Node.js runtime) — один файл `api/lead.ts` |
| Email-доставка | `nodemailer` через SMTP |
| Хостинг | Vercel (статика из `dist/` + serverless function) |
| Тестирование | `vitest` + `@testing-library/react` + `jsdom` |

Никаких UI-библиотек, CSS-in-JS, framer-motion, CMS. Анимации — Tailwind-классами с `motion-safe:`.

## 3. Структура репозитория

```
screed/
├── src/
│   ├── App.tsx                      # читает siteConfig, рендерит блоки в порядке
│   ├── main.tsx                     # vite-ssg entry
│   ├── config/
│   │   └── site.ts                  # ВСЁ редактируемое: имя, телефон, контент, цены, цвета
│   ├── components/
│   │   ├── Hero/index.tsx
│   │   ├── Services/index.tsx
│   │   ├── Quiz/
│   │   │   ├── index.tsx            # стейт-машина шагов (useReducer)
│   │   │   ├── QuizStep1..5.tsx
│   │   │   └── reducer.ts
│   │   ├── Pricing/index.tsx
│   │   ├── Cases/index.tsx
│   │   ├── About/index.tsx
│   │   ├── Calculator/index.tsx     # одна форма + lib/pricing
│   │   ├── Reviews/index.tsx
│   │   ├── LeadForm/index.tsx
│   │   ├── FAQ/index.tsx
│   │   ├── Footer/index.tsx
│   │   ├── ConsultationBanner/
│   │   │   ├── index.tsx            # auto-show при scroll≥50% + FAB
│   │   │   ├── ConsultationCard.tsx # модал по центру, лёгкий backdrop
│   │   │   └── useScrollTrigger.ts  # хук на 50%-маркер
│   │   ├── LeadSuccess.tsx          # общий success-экран для всех 4 источников
│   │   └── ui/
│   │       ├── Button.tsx           # cva-варианты внутри файла
│   │       ├── Field.tsx            # label + input/textarea + error
│   │       └── PillGroup.tsx        # radio-выбор пилюлями
│   ├── lib/
│   │   ├── lead.ts                  # клиент: postLead(payload)
│   │   ├── pricing.ts               # формула калькулятора по siteConfig.pricing
│   │   ├── schemas.ts               # zod-схемы payload + contact
│   │   ├── tg.ts                    # SERVER ONLY: sendTelegramMessage
│   │   ├── email.ts                 # SERVER ONLY: sendEmail (nodemailer SMTP)
│   │   └── vk.ts                    # SERVER ONLY: sendVkMessage
│   └── styles/
│       └── index.css                # @tailwind + base reset
├── api/
│   └── lead.ts                      # POST: zod → fan-out (TG + Email + VK)
├── tests/
│   ├── lib/
│   │   ├── pricing.test.ts
│   │   ├── schemas.test.ts
│   │   └── lead.test.ts
│   ├── api/
│   │   └── lead.test.ts             # интеграционный с моками каналов
│   └── components/
│       ├── Quiz.test.tsx
│       ├── Calculator.test.tsx
│       ├── LeadForm.test.tsx
│       └── ConsultationBanner.test.tsx
├── public/                          # фото мастера, кейсов, og-image
├── .env.example
├── tailwind.config.ts               # импортирует siteConfig.theme
├── vite.config.ts                   # с vite-ssg
└── package.json
```

`src/lib/tg.ts`, `email.ts`, `vk.ts` импортируются **только из `api/lead.ts`** — на клиент они не попадают, секреты безопасны.

## 4. Конфиг (`src/config/site.ts`)

Один TypeScript-объект, типизированный, с дефолтными значениями-заглушками:

```ts
export const siteConfig = {
  master: {
    name: 'Имя Мастер',                    // переменная
    phone: '+7 (999) 000-00-00',           // переменная
    city: 'Москва',
    experienceYears: 10,
    photoUrl: '/images/master.jpg',        // или undefined
  },
  contacts: {
    whatsapp: '+79990000000',              // wa.me/...
    telegram: 'https://t.me/screed_master',
    vk: 'https://vk.com/screed_master',
    email: 'master@example.com',
  },
  seo: {
    title: 'Стяжка пола под ключ в Москве — Имя Мастер',
    description: 'Полусухая, мокрая, наливные полы. Опыт 10 лет, гарантия 5 лет.',
    ogImage: '/og.jpg',
  },
  theme: {
    accent:     '#ea580c',                       // safety orange — CTA, акценты, разметка
    accentDark: '#c2410c',                       // hover вариант
    bg:         '#1f2937',                       // concrete grey — фон страницы
    surface:    'rgba(255,255,255,0.05)',        // карточки, инпуты
    text:       'rgba(255,255,255,0.95)',        // основной текст
    muted:      'rgba(255,255,255,0.65)',        // вторичный текст
    border:     'rgba(255,255,255,0.18)',        // границы
    shadow:     '#d1d5db',                       // светло-серая тень-смещение под brutalist (необязательно)
    fontSans:    "'Archivo', system-ui, -apple-system, sans-serif",
    fontDisplay: "'Archivo Black', 'Archivo', system-ui, sans-serif", // только для заголовков (h1, h2) и CTA
  },
  leadForm: {
    backgroundImageUrl: undefined,               // фон-фото за формой (опционально)
  },
  hero: { headline, subheadline, ctaText, imageUrl? },
  services: [{ title, description }, ...],
  cases:    [{ title, beforeUrl, afterUrl, description? }, ...],
  reviews:  [{ author, text, rating }, ...],
  faq:      [{ question, answer }, ...],
  pricing: {
    rates: { semidry: 450, wet: 600, selfLevel: 750 },              // ₽/м²
    thicknessMultiplier: { 40: 1, 60: 1.15, 80: 1.3, 100: 1.5 },
    extras: { reinforcement: 40, overUnderfloor: 80, demolition: 100 } // ₽/м²
  }
} as const;
```

`tailwind.config.ts` импортирует `siteConfig.theme` и подставляет в `colors.{accent,bg,surface,text,muted}`. Поменять цвет = поправить одну строку в `site.ts` и пересобрать.

**Секреты в `.env.local` (Vercel env vars в проде):**
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
```

## 5. Структура страницы

11 блоков на одной HTML-странице, рендерятся `App.tsx` сверху вниз:

1. **Hero** — `headline`, `subheadline`, CTA на якорь `#form`, телефон мастера в шапке.
2. **Services** — карточки услуг (полусухая / мокрая / наливная / с тёплым полом).
3. **Quiz** — 5 шагов лид-магнит (см. §6.1).
4. **Pricing** — таблица прайса (значения из `siteConfig.pricing.rates`).
5. **Cases** — фото работ до/после.
6. **About** — фото мастера, опыт, гарантии.
7. **Calculator** — расчёт стоимости с захватом контакта (см. §6.2).
8. **Reviews** — карточки отзывов.
9. **LeadForm** — компактная форма (телефон + канал + комментарий).
10. **FAQ** — раскрывающиеся блоки 5–7 типовых вопросов.
11. **Footer** — контакты, соцсети, копирайт.

Сверх этого — оверлей-уровень:

- **ConsultationBanner** (см. §6.3) — FAB-кнопка справа снизу + автоматическая центрированная карточка-форма при scroll≥50%.

## 6. Интерактивные блоки

Все четыре блока ведут к одной `/api/lead` функции, различаются только формой payload. Унифицированный тип `Contact`:

```ts
type Contact = {
  phone: string;                                              // обязательно, валидируется regex'ом +7...
  channel: 'whatsapp' | 'telegram' | 'call' | 'any';
  name?: string;
  comment?: string;
};

type LeadPayload =
  | { type: 'quiz';         answers: QuizAnswers; contact: Contact; _hp?: string }
  | { type: 'calculator';   params: CalcParams; estimatedPrice: number; breakdown: PriceBreakdown; contact: Contact; _hp?: string }
  | { type: 'form';         contact: Contact; _hp?: string }
  | { type: 'consultation'; contact: Contact; _hp?: string };  // канал по умолчанию = 'whatsapp'

// _hp — honeypot. Скрытое поле в DOM-формах через `display: none` + `aria-hidden`.
// Ботов цепляет автозаполнение, реальные пользователи не видят. Если непусто —
// /api/lead возвращает 200 OK, но никуда не отправляет (см. §7 шаг 3).
```

### 6.1 Квиз — 5 шагов

Стейт через `useReducer`. Один редьюсер:
```ts
type QuizState = {
  step: 1 | 2 | 3 | 4 | 5;
  answers: {
    roomType?: 'apartment' | 'house' | 'commercial' | 'other';
    area?: 'lt30' | '30-60' | '60-100' | 'gt100';
    screedType?: 'semidry' | 'wet' | 'selfLevel' | 'unsure';
    timing?: 'thisMonth' | 'within3m' | 'later' | 'looking';
    contact?: Contact;
  };
};
```

- Шаги 1–4: `PillGroup` с одиночным выбором, клик = `dispatch({ type: 'answer', step, value })` + автопереход.
- Шаг 5: `react-hook-form` + `zod` (телефон обязателен и валидный, канал radio из 4 вариантов, имя опциональное, комментарий опциональный).
- Анимация переходов: `key={step}` + `motion-safe:transition-opacity duration-200`.
- На submit шага 5 — `postLead({ type: 'quiz', answers, contact })`. Затем `LeadSuccess`.

### 6.2 Калькулятор — расчёт без показа цены

Одна форма на `react-hook-form` со всеми полями:
- `area: number` (м²),
- `type: 'semidry' | 'wet' | 'selfLevel'` (PillGroup),
- `thickness: 40 | 60 | 80 | 100` (PillGroup),
- `extras: ('reinforcement' | 'overUnderfloor' | 'demolition')[]` (multi-checkbox, inline в файле — не выносим в примитив),
- `phone`, `channel`.

При submit:
1. `lib/pricing.ts` → `calculate({ area, type, thickness, extras }, siteConfig.pricing)` возвращает `{ estimatedPrice, breakdown }`.
2. `postLead({ type: 'calculator', params, estimatedPrice, breakdown, contact })`.
3. `LeadSuccess`.

**Клиенту цена в UI не показывается ни на каком этапе.** Считается только для отправки мастеру.

### 6.5 Визуальный язык — brutalist / industrial

Применяется ко всем компонентам.

- **Геометрия:** все контейнеры, карточки, кнопки, инпуты — **прямоугольные без закруглений** (`rounded-none`). Никаких `rounded-2xl`/`rounded-full`. Исключение: одно — точка-индикатор (status dot) — может оставаться круглой.
- **CTA-кнопка** (Button variant=primary) — **пятиугольник со стрелкой справа** через `clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)`. Размер `lg` — `clip-path` со стрелкой 22px. На hover — стрелка-индикатор сдвигается через `motion-safe:transition`.
- **Secondary/ghost кнопки** — прямоугольные, толстая рамка 2–3px, без стрелки.
- **Заголовки H1/H2** — `font-display` (Archivo Black) + `uppercase` + `tracking-tight`. Этот стиль усиливает индустриальный характер.
- **Тени:** не радиальные blur-shadow, а **offset-shadow без размытия** в стиле neo-brutalism: `shadow-[6px_6px_0_0_theme(colors.shadow)]`. Применяется на ключевых CTA и карточках, не везде.
- **Border style:** `border-2` или `border-3` (`border-[3px]`). Жирные рамки — часть характера.
- **Декоративные элементы:** оранжевая полоса 4px поверху Hero как «строительная разметка»; угловые маркеры в стиле чертёжных засечек на ключевых блоках; штамп-блоки «№ 01 · СТЯЖКА» в углах (опционально).
- **Backdrop модала:** прямой `rgba(15,15,20,0.25)`, без размытия (см. §6.3).

### 6.7 Декоративные элементы (характер дизайна)

Шесть переиспользуемых компонентов в `src/components/ui/` дают лендингу узнаваемый характер. Все используют палитру (accent + grey + text/muted) и шрифт `font-display`.

**1. `SectionIndex` — крупные индексы секций.**
- Перед заголовком каждой контентной секции (Services, Pricing, Cases, About, Calculator, Reviews, FAQ — итого ~7 экземпляров).
- Рендерит большой оранжевый номер `01.`, `02.`, ... + label «Раздел» + сам заголовок.
- Props: `index: string` (например, `'02'`), `label?: string` (default: `'Раздел'`), `title: string`.
- Размер цифры: `font-display text-6xl sm:text-7xl lg:text-8xl text-accent`.
- Hero не получает индекс — он «нулевой», не пронумерованный.

**2. `Marquee` — бегущая строка.**
- Один экземпляр между Hero и Services. Возможно второй в Footer (опционально).
- Бесконечная горизонтальная прокрутка списка ключевых слов через CSS `@keyframes` (без JS).
- Props: `items: string[]`, `bg?: 'accent' | 'surface'` (default `accent`), `speed?: number` (default 18s).
- Дублирует список 2× для seamless-loop.
- Пауза при `prefers-reduced-motion: reduce` — обязательно.

**3. `CountUp` — анимированный счётчик.**
- В блоке About для 3-х метрик (опыт лет / объектов / лет гарантии). Цифры берутся из `siteConfig.about.stats[]`.
- Props: `target: number`, `suffix?: string` (`'+'`), `label: string`, `duration?: number` (default 1500ms).
- IntersectionObserver: запускает count-up когда блок появляется в viewport. Один раз.
- При `prefers-reduced-motion: reduce` — сразу показывает финальное значение.

**4. `ConstructionTape` — диагональные оранжево-серые полосы.**
- Используется максимум **дважды** на странице: 1) разделитель между Hero и Services, 2) опционально перед Footer. Иначе — кричит.
- Полоса полной ширины, высота 24px, паттерн `repeating-linear-gradient(135deg, accent 0 12px, bg 12px 24px)`.

**5. `DimensionLine` — размерная подпись (как на чертеже).**
- Под главным CTA в Hero. Опционально — рядом с другими CTA.
- Маленькая горизонтальная линия с засечками по краям + надпись моноширинным шрифтом (`font-mono`, JetBrains Mono из Google Fonts).
- Props: `label: string` (например, `'CTA-001'`), `width?: 'sm' | 'md'`.
- Не интерактивный, чисто декоративный, `aria-hidden="true"`.

**6. `Stamp` — оранжевый штамп с лёгким наклоном.**
- В правом верхнем углу Hero (на десктопе). На мобильном — скрывается.
- Props: `lines: string[]` (1–3 строки), `rotation?: number` (default `-4deg`).
- Стиль: `border-2 border-accent text-accent uppercase font-display tracking-widest text-xs`, `transform: rotate(-4deg)`, лёгкий accent/5 фон.
- Только декоративный — `aria-hidden="true"`.

**Приоритет применения:**
- Hero: Stamp (правый верхний угол) + DimensionLine (под CTA).
- Marquee: один раз между Hero и Services.
- SectionIndex: на каждой контентной секции (Services через FAQ).
- ConstructionTape: один раз перед Footer (или вместо него — между Reviews и LeadForm).
- CountUp: только в About (3 метрики).

`siteConfig` дополняется:
```ts
about: {
  headline: string;
  bullets: string[];
  stats: { value: number; suffix?: string; label: string }[];   // для CountUp
};
marquee: { items: string[] };                                   // например ['Полусухая', 'Мокрая', ...]
hero: { ..., stamp?: { lines: string[] } };                     // опциональный штамп
```

Если `marquee.items` пуст — компонент не рендерится. Если `hero.stamp` undefined — штамп не показывается. Это сохраняет принцип «render only from props».

### 6.6 Фоновые изображения секций

Hero и LeadForm поддерживают опциональное фоновое изображение через `siteConfig.hero.imageUrl` и `siteConfig.leadForm.backgroundImageUrl`. Если поле пустое — рендерится сплошной фон `bg-bg`.

**Обработка фото (одинаковая для обеих секций):**
- CSS-фильтр на самом изображении: `grayscale(1) contrast(1.1)`. Чёрно-белое усиленно-контрастное фото не «крадёт» внимание у текста и CTA.
- Поверх — слой `<div>` с тёмным градиент-overlay для читаемости (Hero — диагональный 92%→55%; LeadForm — равномерный 85%→95%).
- Поверх — второй слой с лёгким оранжевым radial-gradient (`rgba(234,88,12,0.12)`) — чтобы фото оставалось в палитре.
- Hero: оранжевая полоса 4px сверху секции (не overlay-зависимая).
- LeadForm: тёмная полупрозрачная карточка `rgba(15,22,35,0.85)` + `backdrop-blur-md` поверх фото — поля формы остаются чёткими и контрастными.

**В коде:** компонент имеет два режима рендера фона — с `imageUrl` и без. Без `imageUrl` — просто `<section className="bg-bg">`. С `imageUrl` — три абсолютных слоя (фото + два overlay'я) перед контентом.

### 6.3 ConsultationBanner — FAB + центрированный модал

**FAB-кнопка** в правом нижнем углу:
- `position: fixed`, `bottom-6 right-6`, `z-40`.
- Видна с `scroll > 200px` (чтобы не закрывать Hero CTA).
- Пульсирует первые 5 секунд после появления (Tailwind `motion-safe:animate-ping` через wrapper-ring), затем спокойная.
- `aria-label="Открыть форму консультации"`.
- Клик → открывает `ConsultationCard`.

**ConsultationCard** — центрированный модал:
- Появляется автоматически один раз при прокрутке ≥ 50% **от высоты документа** (`window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) >= 0.5`). Флаг `consultationShown` в `sessionStorage`.
- Slide-in 250 мс с `motion-safe:transition`.
- **Backdrop**: `rgba(15,15,20,0.25)`, без размытия. Лёгкое затемнение, но контент видно.
- Карточка по центру: `position: fixed`, `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, `max-w-sm`, `rounded-2xl`, `shadow-xl`.
- Поля: `name` (обяз.), `phone` (обяз.). Канал не спрашивается — по умолчанию `whatsapp`.
- Кнопка «Получить консультацию» → `postLead({ type: 'consultation', contact: { name, phone, channel: 'whatsapp' } })`.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`. Trap focus, `Esc` закрывает.

**Не показываем баннер**, если в `sessionStorage` есть флаг `leadSubmitted` (ставится после любого успешного lead-submit).

**Закрытие**: × → `consultationShown = true`, скрыто на сессию. FAB остаётся.

### 6.4 LeadSuccess — общий компонент

Принимает props: `{ masterName: string; channel: Channel }`. Текст:
> Спасибо, {masterName}! Мастер свяжется в течение 15 минут [в WhatsApp / в Telegram / звонком / удобным способом].

Без CTA, кроме маленькой ссылки «На главную» (скролл к Hero). После показа — пользователь не возвращается в форму, чтобы не отправлять дубликаты.

## 7. Backend `/api/lead`

Один файл `api/lead.ts`, Vercel Node.js runtime.

**Алгоритм:**
1. Только `POST` — иначе `405`.
2. Парсинг JSON; валидация zod-схемой по discriminated union на `type`. На фейл — `400 { error: 'invalid_payload', issues }`.
3. Honeypot: если в payload пришло поле `_hp` непустым (скрытый input в формах) — `200 { ok: true }` без отправки. Бот не узнает.
4. Rate-limit: in-memory `Map<ip, lastTimestamp>`, не чаще 1 запроса в 10 секунд с одного IP. Превышение → `429`. **Best-effort:** на Vercel serverless каждая холодная функция стартует с пустой памятью, и параллельные инстансы не разделяют Map — значит атакующий может обойти лимит, попав на разные инстансы. Этого достаточно как мягкого заслона от обычного спама; полноценный rate-limit потребует Vercel KV / Upstash Redis (не в MVP).
5. Формирование текстов:
   - **Telegram-сообщение** (компактное, plain text): тип лида + контакт + параметры в зависимости от type.
   - **Email** (HTML): тот же контент с разметкой и кликабельным `tel:` linkом.
   - **VK** (как Telegram).
6. `Promise.allSettled([sendTelegramMessage(tg), sendEmail({ subject, html }), sendVkMessage(vk)])`.
7. Подсчёт успехов:
   - ≥1 успех → `200 { ok: true, delivered: ['tg', 'email'] }`.
   - 0 успехов → `502 { ok: false }`.
8. `console.log` события — тип лида + последние 4 цифры телефона (`***-**-67`) + список доставленных каналов. В Vercel Logs не должны утекать персональные данные в открытом виде.

**Гарантия:** один упавший канал не теряет лид.

**Безопасность:**
- Все секреты только через Vercel env vars.
- Honeypot отсеивает простых ботов.
- Rate-limit — мягкий заслон от спама.
- CAPTCHA не используем (избыточно для MVP).

**Чего НЕ делаем в MVP:**
- Без Google Sheets лога (TG + Email архив + VK достаточно).
- Без очереди / retry — упало, упало.
- Без webhook на Make/Zapier.

## 8. Тема, accessibility, тестирование

### 8.1 Тема

`siteConfig.theme` → `tailwind.config.ts` → классы `bg-bg`, `text-text`, `bg-accent`, `border-border`, `shadow-shadow` и т.д. Поменять цвет = одна строка в конфиге + ребилд.

Default-палитра проекта: **safety orange (#ea580c) на concrete grey (#1f2937)**. Brutalist/industrial направление — все радиусы 0px, толстые рамки, offset-shadow в стиле neo-brutalism, CTA-стрелка через clip-path. Шрифты: Archivo Black (заголовки + CTA) + Archivo (body). Подробности — §6.5.

### 8.2 Accessibility — обязательный минимум

- `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg` на всех CTA, кнопках, ссылках, инпутах.
- `aria-label` на FAB-кнопке.
- ConsultationCard: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`. Trap focus + `Esc` закрывает.
- `motion-safe:` на всех transition/animate (`prefers-reduced-motion: reduce` уважается).
- Декоративные SVG/иконки: `aria-hidden="true"`. Декоративные изображения: `alt=""`.
- Семантика: `<section>` + `<h1>` (Hero) + `<h2>` (на каждый блок). `<button>` для действий, `<a href="tel:...">` для звонков.
- Цветовой контраст: body `text/75` на `bg` ≥ 4.5:1, headings `text/95` ≥ 7:1.
- Tap-target ≥ 44×44 (минимум `px-6 py-3`).

### 8.3 Тестирование

vitest + jsdom + @testing-library/react.

| Зона | Покрытие |
|---|---|
| `lib/pricing.ts` | юнит: формула для всех комбинаций, edge cases (0 м², 100 мм, all extras) |
| `lib/schemas.ts` | юнит: zod валидация всех 4 типов payload |
| `lib/lead.ts` | юнит: вызов fetch с правильным body, обработка ошибки |
| `api/lead.ts` | интеграционный с моками каналов: (1) валидный → fan-out 3 канала; (2) 1 канал упал → 200; (3) все 3 упали → 502; (4) bad payload → 400; (5) honeypot → 200 без отправки; (6) GET → 405 |
| `Quiz` | переходы между шагами, валидация, submit с правильным payload |
| `Calculator` | смена параметров → правильный payload (с расчётом), submit. Цена в UI не показывается. |
| `LeadForm` | валидация, submit, success-стейт |
| `ConsultationBanner` | scroll до 50% → карточка появилась один раз, повторный scroll → не появляется (sessionStorage), клик FAB → открывает, Esc → закрывает |

E2E через Playwright — пропускаем для MVP.

`npm test` для watch, `npm run test:run` для CI.

## 9. Что НЕ делаем в MVP

- Не делаем мульти-арендность: `[clientSlug]` роут, JSON-конфиг на клиента, варианты блоков. Это всё — отдельный SaaS-проект (см. spec мульти-арендного).
- Не делаем CMS / админку. Контент правится в `site.ts`.
- Не делаем Google Sheets лог (4 канала + Vercel Logs).
- Не делаем CAPTCHA (rate-limit + honeypot).
- Не делаем E2E тесты.
- Не делаем второй язык / международный домен.
- Не делаем PWA / offline.
- Не делаем aналитику в коде (Метрика/GA подключим скриптом из `siteConfig.analytics?.metrikaId` отдельной задачей при необходимости).

## 10. Решённые до старта

- **Доменное имя.** Используем `*.vercel.app` (бесплатное имя Vercel), кастомный домен пока не подключаем.
- **VK-доставка.** Сообщение уходит **обоим** — и основателю, и мастеру. В env добавляем два получателя: `VK_OWNER_USER_ID` (основатель) и `VK_MASTER_USER_ID` (мастер). `lib/vk.ts` отправляет последовательно в оба ID; счёт «успешного канала VK» — если хотя бы одна доставка прошла. Если у мастера нет VK — `VK_MASTER_USER_ID` оставляем пустым, тогда отправка только основателю.
- **Юридика.** Текст согласия на обработку перс. данных и ссылка на политику конфиденциальности — заглушка на старте. Структурно: ссылка `/privacy` (статичная страница на `dist/privacy/index.html` через vite-ssg) и текст под кнопкой «Получить расчёт». Содержимое политики наполняется отдельной задачей.
- **Шрифт.** **Archivo Black** (заголовки h1/h2, `fontDisplay` в `siteConfig.theme`) + **Archivo** (body, `fontSans`). Оба — Google Fonts, поддержка кир+лат. Подключение одной `<link>` в `<head>` через vite-ssg.

## 10.1 Прочие открытые вопросы (не блокируют план)

- **og:image.** Готовое изображение или генерим автоматически на сборке? Решаем при первом реальном контенте.

## 11. Roadmap после MVP

- Подключение Яндекс.Метрики и цели «отправка лида» через `dataLayer.push` в success-стейте каждого блока.
- Замена заглушек реальным контентом (фото мастера/работ, тексты, отзывы).
- A/B тест Hero и CTA.
- (Будущее) Когда понадобится мульти-арендность — этот код становится «нулевым клиентом» в шаблоне SaaS-сервиса (см. отдельный spec).
