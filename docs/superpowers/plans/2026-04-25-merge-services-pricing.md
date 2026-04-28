# Merge Services + Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Объединить блоки `Services` и `Pricing` в один блок «Услуги» с ценой внутри каждой карточки.

**Architecture:** Расширить тип `services` в `siteConfig` ценой и опциональной нотой. Перенести отображение цены в `Services`. Удалить компонент `Pricing` и его вызов в `App.tsx`. Сохранить `pricing.rates / extras / thicknessMultiplier` для калькулятора квиза.

**Tech Stack:** React 19, TypeScript, Tailwind, Vite, vite-react-ssg, Bun.

**Verification approach:** Проект не использует юнит-тесты для презентационных компонентов. Верификация через `bun run typecheck`, `bun run build` и визуальный smoke в браузере (desktop / tablet / mobile через DevTools).

---

## File Structure

**Modify:**
- `src/config/site.ts` — расширяем тип и данные `services`, удаляем `pricing.items`
- `src/components/Services/index.tsx` — добавляем цену + сноску
- `src/App.tsx` — убираем `Pricing`

**Delete:**
- `src/components/Pricing/index.tsx`

---

## Task 1: Расширить тип и данные `services` в конфиге

**Files:**
- Modify: `src/config/site.ts`

- [ ] **Step 1: Обновить тип `services` в `SiteConfig`**

В `src/config/site.ts` найти строку:
```ts
  services: { title: string; description: string }[];
```
Заменить на:
```ts
  services: { title: string; description: string; pricePerM2: number; note?: string }[];
```

- [ ] **Step 2: Обновить данные `services` (4 элемента)**

В `src/config/site.ts` найти блок:
```ts
  services: [
    { title: 'Полусухая стяжка', description: 'Механизированная укладка, готовность к ходьбе через 12 часов.' },
    { title: 'Мокрая стяжка', description: 'Цементно-песчаная смесь, армирование сеткой, набор прочности 7–14 дней.' },
    { title: 'Наливной пол', description: 'Самовыравнивающаяся смесь поверх стяжки, под финишное покрытие.' },
    { title: 'Стяжка с тёплым полом', description: 'Заливка поверх водяного или электрического контура, контроль уклонов.' },
  ],
```
Заменить на:
```ts
  services: [
    { title: 'Полусухая стяжка', description: 'Механизированная укладка, готовность к ходьбе через 12 часов.', pricePerM2: 450, note: 'от' },
    { title: 'Мокрая стяжка', description: 'Цементно-песчаная смесь, армирование сеткой, набор прочности 7–14 дней.', pricePerM2: 600, note: 'от' },
    { title: 'Наливной пол', description: 'Самовыравнивающаяся смесь поверх стяжки, под финишное покрытие.', pricePerM2: 750, note: 'от' },
    { title: 'Стяжка с тёплым полом', description: 'Заливка поверх водяного или электрического контура, контроль уклонов.', pricePerM2: 530, note: 'от' },
  ],
```

- [ ] **Step 3: Удалить `pricing.items` из типа `pricing`**

В `src/config/site.ts` найти:
```ts
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
```
Заменить на:
```ts
  pricing: {
    rates: Record<ScreedType, number>;             // ₽/м² базовая
    thicknessMultiplier: Record<40 | 60 | 80 | 100, number>;
    extras: {
      reinforcement: number;
      overUnderfloor: number;
      demolition: number;
    };
  };
```

- [ ] **Step 4: Удалить `pricing.items` из данных**

В `src/config/site.ts` найти:
```ts
  pricing: {
    items: [
      { name: 'Полусухая стяжка от 50 мм', pricePerM2: 450 },
      { name: 'Мокрая стяжка от 50 мм', pricePerM2: 600 },
      { name: 'Наливной пол', pricePerM2: 750, note: 'от' },
    ],
    rates: { semidry: 450, wet: 600, selfLevel: 750 },
    thicknessMultiplier: { 40: 1, 60: 1.15, 80: 1.3, 100: 1.5 },
    extras: { reinforcement: 40, overUnderfloor: 80, demolition: 100 },
  },
```
Заменить на:
```ts
  pricing: {
    rates: { semidry: 450, wet: 600, selfLevel: 750 },
    thicknessMultiplier: { 40: 1, 60: 1.15, 80: 1.3, 100: 1.5 },
    extras: { reinforcement: 40, overUnderfloor: 80, demolition: 100 },
  },
```

- [ ] **Step 5: Verify typecheck**

Run: `bun run typecheck`
Expected: PASS (никаких ошибок). Если есть ошибки в `Pricing/index.tsx` — это ожидаемо, его мы удалим в Task 3. Эту ошибку временно игнорируем до конца Task 3.

- [ ] **Step 6: НЕ коммитим — typecheck сейчас красный из-за `Pricing` (фиксим в Task 3, коммит в конце)**

---

## Task 2: Перерисовать `Services` с ценой и сноской

**Files:**
- Modify: `src/components/Services/index.tsx`

- [ ] **Step 1: Заменить содержимое `src/components/Services/index.tsx`**

Полный новый текст файла:
```tsx
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { Trowel } from '@/components/ui/icons/Trowel';

type Props = { services: SiteConfig['services'] };

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

export default function Services({ services }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Trowel className="w-10 h-10 sm:w-12 sm:h-12" />}
          title="Услуги"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="bg-surface border-2 border-border p-6 flex flex-col items-center text-center">
              <h3 className="font-display uppercase text-xl">{s.title}</h3>
              <p className="mt-3 text-text/70 leading-relaxed">{s.description}</p>
              <div className="mt-6 pt-6 w-full border-t-2 border-border">
                <span className="font-display text-3xl text-accent whitespace-nowrap">
                  {s.note ? `${s.note} ` : ''}{fmt(s.pricePerM2)} ₽/м²
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Цены ориентировочные. Точную смету пришлю после замера.
        </p>
      </div>
    </section>
  );
}
```

Изменения относительно текущего файла:
- Импорт типа `SiteConfig` теперь даёт `pricePerM2` и `note` через расширенный тип (Task 1).
- Добавлен helper `fmt` для форматирования цены (стащен из `Pricing/index.tsx`).
- Внутри карточки после `<p>` появляется `<div>` с `border-t-2`, который содержит цену.
- Под сеткой добавлена сноска `<p>` с текстом про ориентировочные цены.
- Использован `flex-col items-center text-center` (уже было) — карточка-колонка, всё центрируется.

- [ ] **Step 2: Verify typecheck**

Run: `bun run typecheck`
Expected: ошибки только в `src/components/Pricing/index.tsx` (ссылается на удалённый `pricing.items`). `Services/index.tsx` должен быть зелёным. Полный фикс в Task 3.

---

## Task 3: Удалить `Pricing` и его вызов в `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/Pricing/index.tsx`

- [ ] **Step 1: Удалить файл `src/components/Pricing/index.tsx`**

Run: `rm src/components/Pricing/index.tsx && rmdir src/components/Pricing`
Expected: файл и пустая папка удалены без ошибок.

- [ ] **Step 2: Удалить импорт и рендер `Pricing` в `src/App.tsx`**

Найти:
```tsx
import Pricing from '@/components/Pricing';
```
Удалить эту строку.

Найти:
```tsx
      <Pricing pricing={siteConfig.pricing} />
```
Удалить эту строку.

После изменений `src/App.tsx` должен выглядеть так:
```tsx
import { siteConfig } from '@/config/site';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HeroStats from '@/components/HeroStats';
import Services from '@/components/Services';
import Cases from '@/components/Cases';
import About from '@/components/About';
import Quiz from '@/components/Quiz';
import Reviews from '@/components/Reviews';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import ConsultationBanner from '@/components/ConsultationBanner';

export default function App() {
  return (
    <>
      <Header master={siteConfig.master} />
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
      <HeroStats stats={siteConfig.about.stats} />
      <Services services={siteConfig.services} />
      <Cases cases={siteConfig.cases} />
      <About about={siteConfig.about} master={siteConfig.master} />
      <Quiz />
      <Reviews reviews={siteConfig.reviews} />
      <FAQ faq={siteConfig.faq} />
      <LeadForm />
      <Footer master={siteConfig.master} contacts={siteConfig.contacts} />
      <ConsultationBanner />
    </>
  );
}
```

- [ ] **Step 3: Verify typecheck**

Run: `bun run typecheck`
Expected: PASS (зелёный).

- [ ] **Step 4: Verify build**

Run: `bun run build`
Expected: успешная SSG сборка без ошибок.

- [ ] **Step 5: Commit**

```bash
git add src/config/site.ts src/components/Services/index.tsx src/App.tsx
git rm src/components/Pricing/index.tsx
git commit -m "feat: merge Pricing into Services block with per-card prices"
```

---

## Task 4: Визуальная верификация в браузере

**Files:** ничего не меняем, только смотрим.

- [ ] **Step 1: Запустить dev-сервер**

Run: `bun run dev`
Expected: Vite поднимается, печатает локальный URL (обычно `http://localhost:5173`).

- [ ] **Step 2: Открыть страницу и проверить блок «Услуги»**

Открыть URL в браузере. Скроллить до секции «Услуги».

Проверить вживую:
- Один блок (а не два соседних).
- Заголовок «Услуги» с иконкой `Trowel`.
- 4 карточки с title + description + цена крупно accent-цветом снизу.
- Сноска «Цены ориентировочные. Точную смету пришлю после замера.» под сеткой.
- 4-я карточка «Стяжка с тёплым полом» показывает «от 530 ₽/м²».

- [ ] **Step 3: Mobile / tablet через DevTools**

В DevTools переключить viewport:
- 375px (iPhone SE): 1 колонка, цены не переносятся (`whitespace-nowrap`).
- 768px (iPad): 2 колонки.
- 1280px (laptop): 4 колонки.

- [ ] **Step 4: Проверить квиз (расчёт цены)**

Скроллить до квиза, пройти все 5 шагов. На последнем шаге должна показаться рассчитанная цена — это значит `pricing.rates / extras / thicknessMultiplier` целы.

- [ ] **Step 5: Остановить dev**

`Ctrl+C` в терминале с dev-сервером.

---

## Self-Review

**Spec coverage:**
- ✅ Объединённый блок `Services` с заголовком «Услуги» и иконкой `Trowel` → Task 2.
- ✅ 4 карточки с title + description + разделитель + цена `text-accent text-3xl font-display` → Task 2.
- ✅ Цена для 4-й услуги (530 ₽/м², note 'от') → Task 1, Step 2.
- ✅ Сноска под сеткой → Task 2.
- ✅ Расширение типа services + добавление цен → Task 1.
- ✅ Удаление `pricing.items` → Task 1, Steps 3–4.
- ✅ Сохранение `pricing.rates / extras / thicknessMultiplier` → Task 1, Step 4 (явно оставлены).
- ✅ Удаление компонента `Pricing` и его вызова в `App.tsx` → Task 3.
- ✅ Визуальная проверка адаптива и квиза → Task 4.

**Placeholder scan:** нет TODO / TBD / "implement later". Все code-блоки полные.

**Type consistency:** `pricePerM2: number`, `note?: string` идентичны в Task 1 (тип) и Task 1 (данные) и Task 2 (рендер). `fmt(s.pricePerM2)` соответствует имени поля. Импорт `SiteConfig['services']` корректен.
