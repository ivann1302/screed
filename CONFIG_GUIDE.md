# Работа с константами и конфигами услуг

Этот проект сделан как шаблон лендинга. Основная идея: для нового клиента или похожей услуги менять данные в конфиге, а компоненты не трогать.

## Главные файлы

- `src/config/site.ts` — главный файл констант сайта.
- `src/config/cases.ts` — кейсы и изображения работ.
- `public/images/` — изображения hero, кейсов и других секций.
- `public/icons/` — `logo.png` и `favicon.png`.
- `index.html` — содержит только плейсхолдеры SEO, они подставляются из `siteConfig` через `vite.config.ts`.

## Как менять цвета сайта

Все основные цвета находятся в `siteConfig.theme` в `src/config/site.ts`.

```ts
theme: {
  accent: '#ea580c',
  accentDark: '#c2410c',
  onAccent: '#1f2937',
  bg: '#1f2937',
  bgDark: '#000000',
  surface: 'rgba(255,255,255,0.05)',
  text: 'rgba(255,255,255,0.95)',
  muted: 'rgba(255,255,255,0.65)',
  border: 'rgba(255,255,255,0.18)',
  shadow: '#d1d5db',
  danger: '#f87171',
  overlay: 'rgba(15,15,20,0.25)',
  heroGlow: 'rgba(234,88,12,0.16)',
}
```

После изменения цветов перезапусти dev-сервер или пересобери проект. Tailwind читает эти значения из `tailwind.config.ts`.

## Что менять для нового клиента по стяжке

В `src/config/site.ts` обычно меняются:

- `master` — имя, телефон, город, фото.
- `project.minAreaM2` — минимальная площадь объекта.
- `project.serviceShortName` — короткое название услуги в шапке и футере.
- `contacts` — WhatsApp, Telegram, VK, email.
- `seo` — title, description, ogImage.
- `assets` — пути к logo, favicon, hero image.
- `hero` — главный заголовок, подзаголовок, CTA, печать.
- `services` — услуги и цены.
- `whyUs` — преимущества.
- `reviews` — отзывы.
- `faq` — вопросы и ответы.
- `about` — текст “О нас” и цифры.
- `pricing` — ставки, коэффициенты и допы, если используется расчет.

Кейсы меняются в `src/config/cases.ts`. Изображения для них клади в `public/images/` и указывай путь вида `/images/case-name.jpg`.

## Тексты интерфейса

Большинство текстов кнопок, форм, квиза, калькулятора и сообщений владельцу лежат в `uiText` в `src/config/site.ts`.

Например:

- `uiText.cta.orderScreed`
- `uiText.leadForm.title`
- `uiText.quiz`
- `uiText.calculator`
- `uiText.consultation`
- `uiText.leadMessage`

Если нужно поменять формулировки без изменения логики, сначала ищи их там.

## Квиз и калькулятор для стяжки

Опции квиза:

- `quizOptions.roomType`
- `quizOptions.area`
- `quizOptions.screedType`
- `quizOptions.timing`

Опции калькулятора:

- `calculatorScreedOptions`
- `calculatorThicknessOptions`
- `CALCULATOR_TOTAL_STEPS`

Подписи для отправки лида владельцу находятся в `uiText.leadMessage`.

## Как готовить конфиг для другой услуги

Для другой услуги лучше не переписывать компоненты сразу. Сначала меняй конфиг:

1. `project.serviceShortName`: например, `Мягкая кровля`.
2. `hero`, `seo`, `services`, `faq`, `about`, `reviews`.
3. `quizOptions` под новую услугу.
4. `calculatorScreedOptions` и `calculatorThicknessOptions` заменить на опции новой услуги.
5. `uiText.calculator` переименовать шаги и поля.
6. `uiText.leadMessage` заменить подписи в сообщении владельцу.

Примеры:

Для мягкой кровли:

- площадь кровли;
- тип работ: монтаж, ремонт, гидроизоляция;
- материал: рулонная кровля, мембрана, мастика;
- допы: демонтаж, утепление, водостоки.

Для штукатурных работ:

- площадь стен;
- тип штукатурки: механизированная, ручная, гипсовая, цементная;
- допы: маяки, сетка, откосы, материалы подрядчика.

## Что пока остается отдельным

`public/privacy/index.html` сейчас статический. Если нужно полностью менять сайт из одного конфига, следующий шаг — генерировать privacy-страницу из `siteConfig.legal` или перенести ее в React/SSG-роут.

## Проверка после изменений

После правок конфига запускай:

```bash
npm run typecheck
npm run test:run
npm run build
```

Если менялись только тексты и изображения, чаще всего достаточно `npm run build`, но перед публикацией лучше прогонять все три команды.
