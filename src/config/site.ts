import { caseItems, type CaseItem } from './cases';

// Каналы связи, которые можно выбрать в формах и квизах.
export type Channel = 'whatsapp' | 'telegram' | 'call' | 'max' | 'any';
// Базовые типы стяжки, которые используются в услугах, квизе и калькуляторе.
export type ScreedType = 'semidry' | 'wet' | 'selfLevel';
// Тип стяжки с вариантом "не знаю" для квиза.
export type ScreedTypeWithUnsure = ScreedType | 'unsure';
// Предустановленные значения толщины слоя в калькуляторе.
export type ThicknessPreset = 40 | 60 | 80 | 100;
// Выбор толщины: готовый пресет или ручной ввод.
export type ThicknessChoice = ThicknessPreset | 'other';

// Канал связи по умолчанию во всех контактных формах.
export const DEFAULT_CONTACT_CHANNEL: Channel = 'whatsapp';
// Количество шагов в пошаговом калькуляторе.
export const CALCULATOR_TOTAL_STEPS = 5;

// Все варианты каналов связи для расширенных форм.
export const contactChannelOptions: { value: Channel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'call', label: 'Звонок' },
  { value: 'max', label: 'MAX' },
  { value: 'any', label: 'Без разницы' },
];

// В калькуляторе скрываем вариант "без разницы", чтобы лид был более конкретным.
export const calculatorContactChannelOptions = contactChannelOptions.filter((o) => o.value !== 'any');

// Человекочитаемые названия типов стяжки для UI и сообщений владельцу.
export const screedTypeLabels: Record<ScreedTypeWithUnsure, string> = {
  semidry: 'Полусухая',
  wet: 'Мокрая',
  selfLevel: 'Наливной пол',
  unsure: 'Не знает, нужна консультация',
};

// Варианты типа стяжки для калькулятора.
export const calculatorScreedOptions: { value: ScreedType; label: string }[] = [
  { value: 'semidry', label: screedTypeLabels.semidry },
  { value: 'wet', label: screedTypeLabels.wet },
  { value: 'selfLevel', label: screedTypeLabels.selfLevel },
];

// Варианты толщины слоя в калькуляторе.
export const calculatorThicknessOptions: { value: ThicknessChoice; label: string }[] = [
  { value: 40, label: '40 мм' },
  { value: 60, label: '60 мм' },
  { value: 80, label: '80 мм' },
  { value: 100, label: '100 мм' },
  { value: 'other', label: 'Другая' },
];

// Подписи каналов связи в сообщениях владельцу сайта.
export const channelLabels: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  call: 'звонок',
  max: 'MAX',
  any: 'без разницы',
};

// Подписи типов помещений для основного квиза.
export const roomTypeLabels: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом / коттедж',
  commercial: 'Офис / коммерция',
  other: 'Другое',
};

// Подписи диапазонов площади для основного квиза.
export const areaLabels: Record<string, string> = {
  lt30: 'до 30 м²',
  '30-60': '30–60 м²',
  '60-100': '60–100 м²',
  gt100: '100+ м²',
};

// Подписи сроков начала работ для основного квиза.
export const timingLabels: Record<string, string> = {
  thisMonth: 'В этом месяце',
  within3m: 'В течение 3 мес.',
  later: 'Позже',
  looking: 'Просто смотрит',
};

// Подписи типов лидов в Telegram, email и VK.
export const leadTypeLabels = {
  quiz: 'КВИЗ',
  calculator: 'КАЛЬКУЛЯТОР',
  form: 'ФОРМА',
  consultation: 'КОНСУЛЬТАЦИЯ',
} as const;

// Заголовки секций лендинга.
export const sectionTitles = {
  services: 'Услуги',
  whyUs: 'Почему мы',
  cases: 'Наши работы',
  calculator: 'Калькулятор стяжки',
  quiz: 'Подбор стяжки',
  reviews: 'Отзывы',
  faq: 'Частые вопросы',
} as const;

// Опции пошагового квиза "Подбор стяжки".
export const quizOptions = {
  // Шаг 1: тип помещения.
  roomType: [
    { value: 'apartment', label: 'Квартира' },
    { value: 'house', label: 'Дом / коттедж' },
    { value: 'commercial', label: 'Офис / коммерция' },
    { value: 'other', label: 'Другое' },
  ],
  // Шаг 2: примерная площадь.
  area: [
    { value: 'lt30', label: 'до 30 м²' },
    { value: '30-60', label: '30–60 м²' },
    { value: '60-100', label: '60–100 м²' },
    { value: 'gt100', label: '100+ м²' },
  ],
  // Шаг 3: тип стяжки или запрос консультации.
  screedType: [
    { value: 'semidry', label: screedTypeLabels.semidry },
    { value: 'wet', label: screedTypeLabels.wet },
    { value: 'selfLevel', label: screedTypeLabels.selfLevel },
    { value: 'unsure', label: 'Не знаю, посоветуйте' },
  ],
  // Шаг 4: планируемые сроки.
  timing: [
    { value: 'thisMonth', label: timingLabels.thisMonth },
    { value: 'within3m', label: timingLabels.within3m },
    { value: 'later', label: timingLabels.later },
    { value: 'looking', label: 'Просто смотрю' },
  ],
} as const;

// Все интерфейсные тексты, которые не являются основным контентом секций.
export const uiText = {
  // Общие короткие подписи, используемые в нескольких формах.
  common: {
    phonePlaceholder: '+7 (___) ___-__-__',
    privacyShort: 'Политика',
    privacyFull: 'Политика конфиденциальности',
    submitSending: 'Отправляем...',
    submitSendingEllipsis: 'Отправляем…',
    back: 'Назад',
  },
  // Тексты CTA-кнопок.
  cta: {
    orderScreed: 'Заказать стяжку',
    getEstimate: 'Получить расчёт',
    getConsultation: 'Получить консультацию',
    sendParams: 'Отправить параметры',
  },
  // Служебный текст под блоком услуг.
  services: {
    priceNote: 'Цены ориентировочные. Точную смету пришлю после замера.',
  },
  // Тексты футера.
  footer: {
    rights: 'Все права защищены.',
  },
  // Тексты экрана успешной отправки лида.
  leadSuccess: {
    title: 'Спасибо!',
    messageSuffix: 'свяжется в течение 15 минут',
    channelText: {
      whatsapp: 'в WhatsApp',
      telegram: 'в Telegram',
      call: 'звонком',
      max: 'в MAX',
      any: 'удобным способом',
    } satisfies Record<Channel, string>,
  },
  // Тексты основной формы заявки.
  leadForm: {
    title: 'Заказать бесплатную консультацию',
    phoneLabel: 'Телефон',
    channelLabel: 'Где удобнее связаться',
    nameLabel: 'Имя (необязательно)',
    errorPrefix: 'Не удалось отправить. Позвоните напрямую: ',
  },
  // Тексты основного квиза.
  quiz: {
    stepLabel: 'Шаг',
    totalLabel: 'из',
    back: '← Назад',
    roomTypeTitle: 'Тип помещения?',
    roomTypeAria: 'Тип помещения',
    areaTitle: 'Площадь?',
    areaAria: 'Площадь',
    screedTypeTitle: 'Тип стяжки?',
    screedTypeAria: 'Тип стяжки',
    timingTitle: 'Когда планируете?',
    timingAria: 'Сроки',
    contactTitle: 'Куда прислать расчёт?',
    contactHint: 'Мастер свяжется в течение 15 минут.',
    commentLabel: 'Комментарий (необязательно)',
    serverErrorPrefix: 'Не удалось отправить. Позвоните: ',
  },
  // Тексты пошагового калькулятора-квиза.
  calculator: {
    introTitle: 'Соберём параметры для точного расчёта',
    introText: 'Мастер проверит вводные и отправит финальную смету после заявки.',
    stepLabel: 'Шаг',
    totalLabel: 'из',
    areaTitle: 'Какая площадь объекта?',
    areaLabel: 'Площадь объекта, м²',
    areaAria: 'Площадь объекта',
    minAreaHint: 'Минимальный объект',
    minAreaError: 'Берём объекты от',
    typeTitle: 'Какой тип стяжки нужен?',
    typeAria: 'Тип стяжки',
    thicknessTitle: 'Какая толщина слоя?',
    thicknessAria: 'Толщина слоя',
    customThicknessLabel: 'Другая толщина слоя, мм',
    customThicknessError: 'Укажите толщину от 1 до 300 мм',
    customThicknessPlaceholder: 'Например, 70',
    extrasTitle: 'Что учесть в заявке?',
    // Чекбоксы дополнительных параметров объекта.
    extras: {
      reinforcement: { title: 'Армирование', text: 'Сетка или фибра по задаче объекта' },
      overUnderfloor: { title: 'Тёплый пол', text: 'Контур уже уложен или планируется' },
      materialsIncluded: { title: 'Наши материалы', text: 'Учитывать материалы мастера' },
    },
    contactIntro: 'Параметры собраны. Оставьте контакт, и мастер получит заявку с таблицей вводных.',
    next: 'Дальше',
    showForm: 'Показать форму',
    edit: 'Изменить',
    summaryTitle: 'Сводка',
    // Подписи в правой сводке калькулятора.
    summaryLabels: {
      area: 'Площадь',
      type: 'Тип',
      thickness: 'Толщина',
      reinforcement: 'Армирование',
      overUnderfloor: 'Тёплый пол',
      materials: 'Материалы',
      yes: 'Да',
      no: 'Нет',
      ownMaterials: 'Свои',
      masterMaterials: 'Наши',
      clarify: 'уточнить',
    },
    nextStepTitle: 'Следующий шаг',
    nextStepText: 'После отправки мастер получит таблицу параметров и рассчитает смету вручную.',
  },
  // Тексты всплывающей формы консультации.
  consultation: {
    fabAria: 'Открыть форму консультации',
    closeAria: 'Закрыть',
    eyebrow: 'Бесплатная консультация',
    title: 'Расскажу о стяжке за 15 минут',
    description: 'Свяжусь в WhatsApp и отвечу на вопросы по вашему объекту.',
    nameLabel: 'Имя',
    consentPrefix: 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.',
    successToast: '✓ Заявка принята',
    error: 'Не удалось отправить. Попробуйте позже.',
  },
  // Подписи внутри карточек кейсов.
  cases: {
    workLabel: 'Работы',
    durationLabel: 'Срок',
  },
  // Подписи и aria-labels для карусели отзывов.
  reviews: {
    prevAria: 'Предыдущий отзыв',
    nextAria: 'Следующий отзыв',
    ratingSuffix: 'из 5',
  },
  // Подписи полей в сообщении владельцу сайта.
  leadMessage: {
    newLeadPrefix: '🔔 Новый лид',
    name: 'Имя',
    phone: 'Телефон',
    channel: 'Канал',
    comment: 'Комментарий',
    roomType: 'Помещение',
    area: 'Площадь',
    screedType: 'Тип стяжки',
    timing: 'Сроки',
    paramsTitle: 'Параметры объекта:',
    tableHeader: 'Параметр           | Значение',
    tableDivider: '-------------------|-----------------------------',
    thickness: 'Толщина',
    reinforcement: 'Армирование',
    overUnderfloor: 'Тёплый пол',
    materialsIncluded: 'Материалы мастера',
    demolition: 'Демонтаж',
    estimate: 'Ориентир',
    work: 'работа',
    extras: 'доп',
    materials: 'материалы (ориентир)',
    manualCalculation: 'Расчёт: требуется ручной расчёт мастера',
  },
} as const;

// Тип главного конфига сайта. Если добавляешь новый блок в siteConfig, опиши его здесь.
export type SiteConfig = {
  // Ссылки в шапке и мобильном меню.
  navLinks: { href: string; label: string }[];
  // Данные владельца, мастера или компании.
  master: {
    name: string;
    phone: string;
    city: string;
    experienceYears: number;
    photoUrl?: string;
  };
  // Общие параметры услуги и проекта.
  project: {
    serviceShortName: string;
    minAreaM2: number;
  };
  // Пути к основным визуальным ассетам из public/.
  assets: {
    logo: string;
    favicon: string;
    heroImage: string;
    ogImage: string;
  };
  // Публичные контакты в футере и ссылках.
  contacts: {
    max: string;          // MAX URL
    whatsapp: string;     // wa.me URL
    telegram: string;     // t.me URL
    vk: string;           // vk.com URL
    email: string;
  };
  // SEO-метаданные. Подставляются в index.html через vite.config.ts.
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  // Цветовые токены сайта. Tailwind читает их в tailwind.config.ts.
  theme: {
    accent: string;
    accentDark: string;
    onAccent: string;
    bg: string;
    bgDark: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    shadow: string;
    danger: string;
    overlay: string;
    heroGlow: string;
  };
  // Контент первого экрана.
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    imageUrl?: string;
    stamp?: { lines: string[] };
  };
  // Настройки фонового изображения секции формы.
  leadForm: {
    backgroundImageUrl?: string;
  };
  // Карточки услуг и базовые цены.
  services: { title: string; description: string; pricePerM2: number; note?: string }[];
  // Преимущества компании.
  whyUs: { title: string; description: string; icon: 'team' | 'budget' | 'transparency' | 'schedule' }[];
  // Кейсы работ, импортируются из src/config/cases.ts.
  cases: CaseItem[];
  // Отзывы клиентов.
  reviews: { author: string; text: string; rating: number }[];
  // Частые вопросы.
  faq: { question: string; answer: string }[];
  // Секция "О нас".
  about: {
    headline: string;
    bio: string[];
    stats: { value: number; suffix?: string; label: string }[];
  };
  // Бегущая строка, если используется в дизайне.
  marquee: { items: string[] };
  // Числа для расчетов и ориентировочных цен.
  pricing: {
    rates: Record<ScreedType, number>;             // ₽/м² базовая
    thicknessMultiplier: Record<ThicknessPreset, number>;
    materialsPerM2: number;
    extras: {
      reinforcement: number;
      overUnderfloor: number;
      demolition: number;
    };
  };
};

// Главный конфиг текущего сайта по стяжке пола.
export const siteConfig: SiteConfig = {
  // Ссылки в верхней навигации.
  navLinks: [
    { href: '#quiz', label: 'Подбор стяжки' },
    { href: '#form', label: 'Заказать расчёт' },
    { href: '#cases', label: 'Наши работы' },
  ],
  // Контактное лицо или бренд, который показывается в шапке, футере и сообщениях.
  master: {
    name: 'Ровный пол',
    phone: '+7 (999) 000-00-00',
    city: 'Москва',
    experienceYears: 10,
    photoUrl: 'https://picsum.photos/seed/master/600/800',
  },
  // Короткое название услуги и минимальный размер объекта.
  project: {
    serviceShortName: 'Стяжка пола',
    minAreaM2: 50,
  },
  // Основные файлы из public/icons и public/images.
  assets: {
    logo: '/icons/logo.png',
    favicon: '/icons/favicon.png',
    heroImage: '/images/heroimage.png',
    ogImage: '/images/heroimage.png',
  },
  // Ссылки на внешние каналы связи.
  contacts: {
    max: 'https://max.ru/screed_master',
    whatsapp: 'https://wa.me/79990000000',
    telegram: 'https://t.me/screed_master',
    vk: 'https://vk.com/screed_master',
    email: 'master@example.com',
  },
  // Title, description и картинка для превью в поиске и мессенджерах.
  seo: {
    title: 'Стяжка пола под ключ в Москве — Иван Иванов',
    description: 'Полусухая, мокрая, наливные полы. Опыт 10 лет, гарантия 5 лет. Замер бесплатно.',
    ogImage: '/images/heroimage.png',
  },
  // Главная палитра сайта. Меняй цвета здесь, а не в компонентах.
  theme: {
    accent:     '#ea580c',
    accentDark: '#c2410c',
    onAccent:   '#1f2937',
    bg:         '#1f2937',
    bgDark:     '#000000',
    surface:    'rgba(255,255,255,0.05)',
    text:       'rgba(255,255,255,0.95)',
    muted:      'rgba(255,255,255,0.65)',
    border:     'rgba(255,255,255,0.18)',
    shadow:     '#d1d5db',
    danger:     '#f87171',
    overlay:    'rgba(15,15,20,0.25)',
    heroGlow:   'rgba(234,88,12,0.16)',
  },
  // Необязательные настройки секции формы.
  leadForm: {
    backgroundImageUrl: undefined as string | undefined,
  },
  // Контент hero-секции.
  hero: {
    headline: 'Стяжка пола под ключ в Москве',
    subheadline: 'От 450 ₽/м². Гарантия 5 лет. Замер бесплатно.',
    ctaText: 'Получить расчёт',
    imageUrl: '/images/heroimage.png',
    stamp: { lines: ['ОПЫТ 10 ЛЕТ', '№ 001 · МОСКВА'] },
  },
  // Список услуг и стартовых цен.
  services: [
    { title: 'Полусухая стяжка', description: 'Механизированная укладка, готовность к ходьбе через 12 часов.', pricePerM2: 450, note: 'от' },
    { title: 'Мокрая стяжка', description: 'Цементно-песчаная смесь, армирование сеткой, набор прочности 7–14 дней.', pricePerM2: 600, note: 'от' },
    { title: 'Наливной пол', description: 'Самовыравнивающаяся смесь поверх стяжки, под финишное покрытие.', pricePerM2: 750, note: 'от' },
    { title: 'Стяжка с тёплым полом', description: 'Заливка поверх водяного или электрического контура, контроль уклонов.', pricePerM2: 530, note: 'от' },
  ],
  // Преимущества, которые объясняют выбор подрядчика.
  whyUs: [
    {
      title: 'Свои бригады',
      description: 'Работаем своим штатом, без субподрядчиков. Каждый мастер — наш, за качество отвечаю лично.',
      icon: 'team',
    },
    {
      title: 'Нераздутый штат экономит ваш бюджет',
      description: 'Без офисных надстроек и менеджерского слоя. Платите за работу, а не за чужую зарплату.',
      icon: 'budget',
    },
    {
      title: 'Прозрачная смета без скрытых надбавок',
      description: 'Цена фиксируется после замера и не меняется по ходу работ. Никаких «всплыло — доплатите».',
      icon: 'transparency',
    },
    {
      title: 'Сдаём в срок — полусухая за 1 день',
      description: 'Укладываем за смену, ходить можно через 12 часов. Сроки фиксируем в договоре.',
      icon: 'schedule',
    },
  ],
  // Список кейсов из отдельного файла, чтобы не раздувать site.ts.
  cases: caseItems,
  // Отзывы для карусели.
  reviews: [
    { author: 'Анна, ЖК Хорошёвский', text: 'Залили за день, ровно по уровню. Через две недели легла плитка без проблем.', rating: 5 },
    { author: 'Дмитрий, прораб', text: 'Работаем с Иваном на трёх объектах. Цена честная, сроки держит.', rating: 5 },
    { author: 'Наталья, Подмосковье', text: 'Делали стяжку под тёплый пол в доме. Аккуратно, без пыли. Перепад по уровню — 2 мм на всю комнату.', rating: 5 },
    { author: 'Сергей, Реутов', text: 'Сделали быстрее, чем обещали. Ребята с уважением — обувают бахилы, выносят мусор.', rating: 5 },
  ],
  // Вопросы и ответы для FAQ.
  faq: [
    { question: 'Сколько по времени делается стяжка?', answer: 'Полусухая — один день работы, ходить можно через 12 часов. Финишное покрытие можно класть через 7–14 дней в зависимости от толщины.' },
    { question: 'Какая гарантия?', answer: 'Гарантия 5 лет на работы. Если есть трещины или отслоения по нашей вине — переделываем бесплатно.' },
    { question: 'Что входит в цену?', answer: 'Работа, материалы, армирование, демонтаж старой стяжки оговаривается отдельно.' },
    { question: 'Выезжаете за МКАД?', answer: 'Да, в пределах 50 км от МКАД без доплаты. Дальше — обсуждается.' },
    { question: 'Принимаете оплату по безналу?', answer: 'Да, работаю как самозанятый. Чек выдам через приложение.' },
  ],
  // Контент секции "О нас" и цифры под hero.
  about: {
    headline: 'О нас',
    bio: [
      'Мы занимаемся устройством стяжки пола в Москве и области больше 10 лет. Работаем с квартирами, домами, офисами и коммерческими помещениями.',
      'На объект выезжает ответственный специалист: фиксируем вводные, согласуем технологию и контролируем процесс от подготовки основания до проверки финального уровня.',
      'Работаем по договору, заранее проговариваем состав работ и материалы. Гарантия 5 лет: если дефект возник по нашей вине, исправляем без доплат.',
    ],
    stats: [
      { value: 10, suffix: '+', label: 'лет опыта' },
      { value: 200, suffix: '+', label: 'объектов сдано' },
      { value: 5,  suffix: '',  label: 'лет гарантия' },
      { value: 0,  suffix: ' ₽', label: 'стоимость выезда' },
    ],
  },
  // Тексты бегущей строки.
  marquee: {
    items: ['Полусухая', 'Мокрая', 'Наливной пол', 'Армирование', 'Тёплый пол', 'Замер бесплатно', 'Гарантия 5 лет'],
  },
  // Ориентировочные цены и коэффициенты. Для лид-квиза можно оставить как справочные.
  pricing: {
    rates: { semidry: 450, wet: 600, selfLevel: 750 },
    thicknessMultiplier: { 40: 1, 60: 1.15, 80: 1.3, 100: 1.5 },
    materialsPerM2: 160,
    extras: { reinforcement: 40, overUnderfloor: 80, demolition: 100 },
  },
};
