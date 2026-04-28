export type CaseItem = {
  title: string;
  location: string;
  area: string;
  workType: string;
  duration: string;
  imageUrl: string;
  description: string;
};

export const caseItems: CaseItem[] = [
  {
    title: 'Офис в Химках',
    location: 'Химки',
    area: '75 м²',
    workType: 'Полусухая 60 мм',
    duration: '1 день',
    imageUrl: '/images/case1.png',
    description: 'Выполнили стяжку в офисном помещении: подготовили основание, выставили уровень и оставили пол готовым под финишное покрытие.',
  },
  {
    title: 'База отдыха в Домодедово',
    location: 'Домодедово',
    area: '180 м²',
    workType: 'Мокрая стяжка 80 мм',
    duration: '2 дня',
    imageUrl: '/images/case2.png',
    description: 'Сделали основание для помещений базы отдыха с контролем толщины слоя, прочности и перепадов по уровню.',
  },
  {
    title: 'Частный дом в Красногорске',
    location: 'Красногорск',
    area: '120 м²',
    workType: 'Наливной пол',
    duration: '1 смена',
    imageUrl: '/images/case3.png',
    description: 'Подготовили ровное основание в частном доме под дальнейшую отделку и укладку чистового напольного покрытия.',
  },
  {
    title: 'Офисное помещение в Москве',
    location: 'Москва',
    area: '50 м²',
    workType: 'Полусухая 50 мм',
    duration: '1 день',
    imageUrl: '/images/case4.jpeg',
    description: 'Выполнили стяжку на объекте от минимальной площади и подготовили пол к следующему этапу ремонта.',
  },
];
