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
    stamp?: { lines: string[] };
  };
  leadForm: {
    backgroundImageUrl?: string;
  };
  services: { title: string; description: string }[];
  cases: { title: string; beforeUrl: string; afterUrl: string; description?: string }[];
  reviews: { author: string; text: string; rating: number }[];
  faq: { question: string; answer: string }[];
  about: {
    headline: string;
    bullets: string[];
    stats: { value: number; suffix?: string; label: string }[];
  };
  marquee: { items: string[] };
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
    subheadline: 'От 450 ₽/м². Гарантия 5 лет. Замер бесплатно.',
    ctaText: 'Получить расчёт',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1920&q=80',
    stamp: { lines: ['ОПЫТ 10 ЛЕТ', '№ 001 · МОСКВА'] },
  },
  services: [
    { title: 'Полусухая стяжка', description: 'Механизированная укладка, готовность к ходьбе через 12 часов.' },
    { title: 'Мокрая стяжка', description: 'Цементно-песчаная смесь, армирование сеткой, набор прочности 7–14 дней.' },
    { title: 'Наливной пол', description: 'Самовыравнивающаяся смесь поверх стяжки, под финишное покрытие.' },
    { title: 'Стяжка с тёплым полом', description: 'Заливка поверх водяного или электрического контура, контроль уклонов.' },
  ],
  cases: [
    {
      title: 'Квартира 75 м² в ЖК Хорошёвский',
      beforeUrl: 'https://picsum.photos/seed/before1/800/520',
      afterUrl: 'https://picsum.photos/seed/after1/800/520',
      description: 'Полусухая 60 мм, 1 день работы, 14 дней до укладки финиша.',
    },
  ],
  reviews: [
    { author: 'Анна, ЖК Хорошёвский', text: 'Залили за день, ровно по уровню. Через две недели легла плитка без проблем.', rating: 5 },
    { author: 'Дмитрий, прораб', text: 'Работаем с Иваном на трёх объектах. Цена честная, сроки держит.', rating: 5 },
  ],
  faq: [
    { question: 'Сколько по времени делается стяжка?', answer: 'Полусухая — один день работы, ходить можно через 12 часов. Финишное покрытие можно класть через 7–14 дней в зависимости от толщины.' },
    { question: 'Какая гарантия?', answer: 'Гарантия 5 лет на работы. Если есть трещины или отслоения по нашей вине — переделываем бесплатно.' },
    { question: 'Что входит в цену?', answer: 'Работа, материалы, армирование, демонтаж старой стяжки оговаривается отдельно.' },
    { question: 'Выезжаете за МКАД?', answer: 'Да, в пределах 50 км от МКАД без доплаты. Дальше — обсуждается.' },
    { question: 'Принимаете оплату по безналу?', answer: 'Да, работаю как самозанятый. Чек выдам через приложение.' },
  ],
  about: {
    headline: 'О мастере',
    bullets: [
      '10 лет опыта в стяжке пола',
      'Лично работаю на каждом объекте, без субподряда',
      'Договор, чек, акт скрытых работ',
      'Бесплатный замер с лазерным уровнем',
    ],
    stats: [
      { value: 10, suffix: '+', label: 'лет опыта' },
      { value: 200, suffix: '+', label: 'объектов сдано' },
      { value: 5,  suffix: '',  label: 'лет гарантия' },
    ],
  },
  marquee: {
    items: ['Полусухая', 'Мокрая', 'Наливной пол', 'Армирование', 'Тёплый пол', 'Замер бесплатно', 'Гарантия 5 лет'],
  },
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
};
