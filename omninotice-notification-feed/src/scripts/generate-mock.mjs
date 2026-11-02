import { mkdirSync, writeFileSync } from 'node:fs';

const TOTAL = 50;
const PER_PAGE = 10;
const OUT_DIR = 'public/mock';
const TODAY_COUNT = 5;
const YESTERDAY_COUNT = 5;
const EARLIER_PER_DAY = 5;
const TIME_CLUSTER_SIZE = 5;
const MINUTES_BETWEEN_NOTIFICATIONS = 5;

const samples = [
  ['📝', 'Назначена новая задача', 'Вам назначена задача «Подготовить отчёт за квартал». Срок: 20 октября.'],
  ['🌴', 'Отпуск согласован', 'Ваш отпуск с 3 по 17 ноября согласован руководителем.'],
  ['📊', 'Опрос: как вам новый корпоративный портал?', null],
  ['🎉', 'С днём рождения, Анна!', 'Команда поздравляет вас и желает успехов в новом году жизни.'],
  ['🔒', 'Обновлён регламент информационной безопасности', 'Ознакомьтесь с новой версией регламента до конца недели.'],
  ['🛠️', 'Плановые технические работы', 'В субботу с 02:00 до 04:00 сервис будет недоступен.'],
  ['📅', 'Напоминание о встрече', 'Совещание отдела начнётся через 30 минут в переговорной «Север».'],
  ['✅', 'Заявка одобрена', 'Ваша заявка на оборудование одобрена и передана в закупку.'],
  ['📄', 'Новый документ на подпись', null],
  ['🏆', 'Вы в числе лучших сотрудников месяца', 'Поздравляем! Спасибо за вклад в общий результат команды.']
];

const details = [];

const items = Array.from({ length: TOTAL }, (_, i) => {
  const [emoji, title, description] = samples[i % samples.length];
  const createdAt = new Date();
  const daysAgo =
    i < TODAY_COUNT
      ? 0
      : i < TODAY_COUNT + YESTERDAY_COUNT
        ? 1
        : 2 + Math.floor((i - TODAY_COUNT - YESTERDAY_COUNT) / EARLIER_PER_DAY);
  createdAt.setDate(createdAt.getDate() - daysAgo);
  createdAt.setHours(
    12,
    -((i % TIME_CLUSTER_SIZE) * MINUTES_BETWEEN_NOTIFICATIONS),
    0,
    0,
  );
  const date = createdAt.toISOString();
  const messageId = `3fa85f64-5717-4562-b3fc-${String(i + 1).padStart(12, '0')}`;
  // номер в заголовке, чтобы видеть порядок и отсутствие дублей
  const fullTitle = `${title} #${i + 1}`;

  // action теперь живёт только в деталях, а не в списке
  const action =
    i % 3 !== 2
      ? {
          url: `https://example.com/tasks/${i + 1}`,
          title: 'Открыть задачу',
          type: 'button'
        }
      : undefined;

  const item = {
    status: 'published',
    created_date: date,
    modified_date: date,
    chit: {
      status: 'published',
      created_date: date,
      modified_date: date,
      message_type: 'simple',
      title: fullTitle,
      description,
      picture:
        i % 4 === 3
          ? null
          : { main: null, preview: null, cover: null, icon: null, emoji },
      message_id: messageId
    },
    is_read: i % 3 === 1
  };

  // детали = тот же объект + text / action / extra (как в контракте деталей)
  details.push({
    messageId,
    item: {
      ...item,
      chit: {
        ...item.chit,
        text: `${
          description ?? 'Подробности этого уведомления доступны по ссылке ниже.'
        } Полный текст уведомления #${i + 1}: здесь подробности, которых нет в коротком описании из списка.`,
        action,
        extra: {},
        message_id: messageId
      }
    }
  });

  return item;
});

mkdirSync(OUT_DIR, { recursive: true });

const pages = Math.ceil(TOTAL / PER_PAGE);
for (let p = 1; p <= pages; p++) {
  const data = items.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const json = {
    data,
    info: {
      api_version: '0.1.0',
      count: data.length,
      total: TOTAL,
      page: p,
      page_size: PER_PAGE
    }
  };
  writeFileSync(`${OUT_DIR}/notifications-${p}.json`, JSON.stringify(json, null, 2));
}

const single = (item) => ({
  data: [item],
  info: { api_version: '0.1.0', count: 1, total: 1, page: 1, page_size: 1 }
});

for (const { messageId, item } of details) {
  writeFileSync(
    `${OUT_DIR}/notification-details-${messageId}.json`,
    JSON.stringify(single(item), null, 2)
  );
}

writeFileSync(
  `${OUT_DIR}/notification-counts.json`,
  JSON.stringify(
    single({
      total_count: TOTAL,
      unread_count: items.filter((item) => !item.is_read).length
    }),
    null,
    2
  )
);

console.log(
  `Готово: ${pages} файлов списков, ${details.length} файлов деталей, ${TOTAL} записей`
);