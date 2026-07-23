import { PrismaClient, type Level } from "@prisma/client";
import { grammarTopicsA1 } from "./grammar-data-a1";
import { grammarTopicsA2 } from "./grammar-data-a2";
import { grammarTopicsB1 } from "./grammar-data-b1";

const prisma = new PrismaClient();

type SeedQuestion =
  | { type: "MULTIPLE_CHOICE"; prompt: string; options: string[]; correctIndex: number }
  | { type: "TRUE_FALSE"; prompt: string; correctBool: boolean }
  | { type: "FILL_BLANK"; prompt: string; correctText: string }
  | { type: "ORDERING"; prompt: string; items: string[] };

type SeedVocab = { hebrew: string; translation: string };

type SeedText = {
  title: string;
  level: Level;
  content: string;
  translation: string;
  vocabulary: SeedVocab[];
  questions: SeedQuestion[];
};

const texts: SeedText[] = [
  {
    title: "המשפחה שלי",
    level: "A1",
    content:
      "שלום! קוראים לי דינה. אני גרה בתל אביב. יש לי משפחה קטנה: אבא, אמא ואח אחד. אבא שלי עובד בבית חולים. אמא שלי מורה בבית ספר. האח שלי קטן, הוא בן חמש. אנחנו אוהבים לאכול ארוחת ערב ביחד.",
    translation:
      "Привет! Меня зовут Дина. Я живу в Тель-Авиве. У меня небольшая семья: папа, мама и один брат. Мой папа работает в больнице. Моя мама — учительница в школе. Мой брат маленький, ему пять лет. Мы любим вместе ужинать.",
    vocabulary: [
      { hebrew: "שלום", translation: "привет / здравствуй" },
      { hebrew: "קוראים לי", translation: "меня зовут" },
      { hebrew: "משפחה", translation: "семья" },
      { hebrew: "אבא", translation: "папа" },
      { hebrew: "אמא", translation: "мама" },
      { hebrew: "אח", translation: "брат" },
      { hebrew: "עובד", translation: "работает" },
      { hebrew: "בית חולים", translation: "больница" },
      { hebrew: "מורה", translation: "учитель(ница)" },
      { hebrew: "בית ספר", translation: "школа" },
    ],
    questions: [
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Где живёт Дина?",
        options: ["Хайфа", "Тель-Авив", "Иерусалим", "Эйлат"],
        correctIndex: 1,
      },
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Сколько лет брату Дины?",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
      },
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Кем работает мама Дины?",
        options: ["Врач", "Учительница", "Повар", "Продавец"],
        correctIndex: 1,
      },
      { type: "TRUE_FALSE", prompt: "יש לדינה שני אחים.", correctBool: false },
      { type: "ORDERING", prompt: "Соберите предложение из текста", items: ["אני", "גרה", "בתל", "אביב"] },
    ],
  },
  {
    title: "יום רגיל שלי",
    level: "A2",
    content:
      "אני קם כל בוקר בשש וחצי. אני שותה קפה ואוכל ארוחת בוקר קטנה. אחר כך אני נוסע לעבודה באוטובוס. אני עובד במשרד גדול במרכז העיר. בצהריים אני אוכל עם החברים שלי במסעדה קרובה. בערב אני חוזר הביתה, קורא ספר והולך לישון מוקדם.",
    translation:
      "Я встаю каждое утро в половине седьмого. Я пью кофе и ем небольшой завтрак. Потом я еду на работу на автобусе. Я работаю в большом офисе в центре города. В обед я ем с моими друзьями в ближайшем ресторане. Вечером я возвращаюсь домой, читаю книгу и ложусь спать рано.",
    vocabulary: [
      { hebrew: "קם", translation: "встаёт" },
      { hebrew: "בוקר", translation: "утро" },
      { hebrew: "שותה", translation: "пьёт" },
      { hebrew: "ארוחת בוקר", translation: "завтрак" },
      { hebrew: "נוסע", translation: "едет" },
      { hebrew: "עבודה", translation: "работа" },
      { hebrew: "משרד", translation: "офис" },
      { hebrew: "חברים", translation: "друзья" },
      { hebrew: "מסעדה", translation: "ресторан" },
      { hebrew: "חוזר", translation: "возвращается" },
    ],
    questions: [
      {
        type: "MULTIPLE_CHOICE",
        prompt: "На чём герой едет на работу?",
        options: ["На машине", "На автобусе", "На поезде", "Пешком"],
        correctIndex: 1,
      },
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Где он обедает?",
        options: ["Дома", "В офисе", "В ресторане с друзьями", "В кафе один"],
        correctIndex: 2,
      },
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Что он делает перед сном?",
        options: ["Смотрит телевизор", "Читает книгу", "Гуляет", "Готовит"],
        correctIndex: 1,
      },
      { type: "FILL_BLANK", prompt: "אני ___ קפה ואוכל ארוחת בוקר קטנה.", correctText: "שותה" },
    ],
  },
  {
    title: "הטיול שלי לצפון",
    level: "B1",
    content:
      "בחופש האחרון נסעתי עם חברים לצפון. יצאנו מוקדם בבוקר והגענו לטבריה אחרי כמעט שלוש שעות נסיעה. ביום הראשון הלכנו לטייל ליד הכנרת ואכלנו דגים במסעדה על שפת המים. ביום השני טיפסנו על הר גבוה, והנוף היה מדהים. היה חם מאוד, אז שחינו באגם כדי להתקרר. בערב ישבנו ליד מדורה ושרנו שירים עד שעה מאוחרת. זה היה אחד הטיולים הכי יפים שעשיתי.",
    translation:
      "На последних каникулах я ездил с друзьями на север. Мы выехали рано утром и добрались до Тверии почти через три часа пути. В первый день мы гуляли у Кинерета и ели рыбу в ресторане на берегу воды. Во второй день мы поднялись на высокую гору, и вид был потрясающий. Было очень жарко, поэтому мы искупались в озере, чтобы охладиться. Вечером мы сидели у костра и пели песни допоздна. Это была одна из самых красивых поездок, которые я совершал.",
    vocabulary: [
      { hebrew: "חופש", translation: "каникулы" },
      { hebrew: "נסענו", translation: "мы поехали" },
      { hebrew: "הגענו", translation: "мы прибыли" },
      { hebrew: "כנרת", translation: "озеро Кинерет" },
      { hebrew: "דגים", translation: "рыба" },
      { hebrew: "טיפסנו", translation: "мы взбирались" },
      { hebrew: "נוף", translation: "вид, пейзаж" },
      { hebrew: "שחינו", translation: "мы плавали" },
      { hebrew: "אגם", translation: "озеро" },
      { hebrew: "מדורה", translation: "костёр" },
    ],
    questions: [
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Куда поехали друзья?",
        options: ["На юг", "На север", "На восток", "На запад"],
        correctIndex: 1,
      },
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Что они ели у Кинерета?",
        options: ["Мясо", "Рыбу", "Пиццу", "Суп"],
        correctIndex: 1,
      },
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Зачем они купались в озере?",
        options: ["Было скучно", "Чтобы охладиться от жары", "Соревнование", "Хотели порыбачить"],
        correctIndex: 1,
      },
      { type: "TRUE_FALSE", prompt: "הם נסעו לצפון הארץ.", correctBool: true },
      { type: "FILL_BLANK", prompt: "היה חם מאוד, אז ___ באגם.", correctText: "שחינו" },
    ],
  },
];

async function main() {
  for (const t of texts) {
    const existing = await prisma.hebrewText.findFirst({ where: { title: t.title } });
    if (existing) {
      console.log(`Обновляю задания: "${t.title}"`);
      await prisma.question.deleteMany({ where: { textId: existing.id } });
      await prisma.question.createMany({
        data: t.questions.map((q, order) => toQuestionRow(q, existing.id, order)),
      });
      continue;
    }

    const created = await prisma.hebrewText.create({
      data: {
        title: t.title,
        level: t.level,
        content: t.content,
        translation: t.translation,
        vocabulary: {
          create: t.vocabulary.map((v, order) => ({ ...v, order })),
        },
      },
    });
    await prisma.question.createMany({
      data: t.questions.map((q, order) => toQuestionRow(q, created.id, order)),
    });
    console.log(`Добавлен текст: ${t.title} (${t.level})`);
  }

  const allGrammarTopics = [...grammarTopicsA1, ...grammarTopicsA2, ...grammarTopicsB1];

  for (const [index, g] of allGrammarTopics.entries()) {
    const existing = await prisma.grammarTopic.findFirst({ where: { title: g.title } });
    const data = {
      level: g.level,
      title: g.title,
      summary: g.summary,
      content: JSON.stringify(g.blocks),
      order: index,
    };

    if (existing) {
      await prisma.grammarTopic.update({ where: { id: existing.id }, data });
      console.log(`Обновлена тема грамматики: "${g.title}"`);
    } else {
      await prisma.grammarTopic.create({ data });
      console.log(`Добавлена тема грамматики: ${g.title} (${g.level})`);
    }
  }
}

function toQuestionRow(q: SeedQuestion, textId: string, order: number) {
  const base = { textId, order, prompt: q.prompt, type: q.type };
  switch (q.type) {
    case "MULTIPLE_CHOICE":
      return { ...base, options: JSON.stringify(q.options), correctIndex: q.correctIndex };
    case "TRUE_FALSE":
      return { ...base, correctBool: q.correctBool };
    case "FILL_BLANK":
      return { ...base, correctText: q.correctText };
    case "ORDERING":
      return { ...base, options: JSON.stringify(q.items) };
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
