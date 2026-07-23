import Link from "next/link";
import {
  BookIcon,
  BlocksIcon,
  LayersIcon,
  BuildingIcon,
  BriefcaseIcon,
  FileTextIcon,
  UsersIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { KnowledgeTree } from "@/components/knowledge-tree";
import { ScrollLink } from "@/components/scroll-link";

const features = [
  {
    href: "/texts",
    Icon: BookIcon,
    title: "Тексты",
    description:
      "Тексты на иврите с переводом, новыми словами и заданиями на понимание. Уровни от Алеф до Гимель.",
    tone: "brand",
  },
  {
    href: "/grammar",
    Icon: BlocksIcon,
    title: "Грамматика",
    description:
      "Разбор грамматики по темам на русском языке — от основ до продвинутых конструкций.",
    tone: "violet",
  },
  {
    href: "/flashcards",
    Icon: LayersIcon,
    title: "Карточки",
    description: "Создавайте свои темы и карточки, учите слова по методу интервального повторения.",
    tone: "emerald",
  },
] as const;

const audience = [
  {
    Icon: BuildingIcon,
    title: "Госучреждения",
    description:
      "Мисрад а-Клита, Битуах Леуми, банк, поликлиника — заявления, звонки и письма почти всегда только на иврите.",
    tone: "brand",
  },
  {
    Icon: BriefcaseIcon,
    title: "Работа",
    description:
      "Собеседования, рабочие чаты и совещания требуют уверенного иврита, даже в компаниях с английским языком.",
    tone: "violet",
  },
  {
    Icon: FileTextIcon,
    title: "Быт и документы",
    description:
      "Договор аренды, счета, письма из садика и школы — разобраться самому, не дожидаясь, пока кто-то переведёт.",
    tone: "amber",
  },
  {
    Icon: UsersIcon,
    title: "Новые связи",
    description: "Соседи, родители в садике, друзья — разговор свободно, а не только фразами из ульпана.",
    tone: "emerald",
  },
] as const;

const steps = [
  { title: "Читайте", description: "Живые тексты по уровням — с переводом и разбором новых слов рядом." },
  { title: "Разбирайте", description: "Грамматика объяснена по-русски, понятно и без учебной сухости." },
  { title: "Повторяйте", description: "Карточки со интервальным повторением закрепляют слова надолго." },
];

const reasons = [
  "Свой темп — без группы, которая либо тормозит, либо убегает вперёд",
  "Объяснения по-русски, а не на иврите, который вы ещё не знаете",
  "Начать можно сегодня, без записи и ожидания места в ульпане",
  "Бесплатно и без рекламы — тексты и грамматика открыты всем",
];

const floatingWords: { he: string; ru: string; top: string; left?: string; right?: string; rotate: number }[] = [
  { he: "שלום", ru: "привет", top: "10%", left: "4%", rotate: -8 },
  { he: "תודה", ru: "спасибо", top: "66%", left: "7%", rotate: 6 },
  { he: "בוקר טוב", ru: "доброе утро", top: "16%", right: "4%", rotate: 7 },
  { he: "מזל טוב", ru: "поздравляю", top: "60%", right: "6%", rotate: -6 },
];

const toneClasses = {
  brand: "bg-brand-100 text-brand-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
};

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-100 via-brand-50 to-white px-6 py-16 text-center sm:px-12 sm:py-24">
        <KnowledgeTree className="pointer-events-none absolute -bottom-6 -right-6 h-[140%] w-auto text-brand-200/70 sm:right-0" />
        <KnowledgeTree className="pointer-events-none absolute -bottom-6 -left-16 hidden h-[110%] w-auto -scale-x-100 text-brand-200/50 lg:block" />

        {floatingWords.map((w) => (
          <div
            key={w.he}
            className="animate-float absolute hidden rounded-xl bg-white px-3 py-2 text-center shadow-[0_8px_20px_-6px_rgba(10,118,172,0.25)] sm:block"
            style={
              {
                top: w.top,
                left: w.left,
                right: w.right,
                "--float-rotate": `${w.rotate}deg`,
                transform: `rotate(${w.rotate}deg)`,
              } as React.CSSProperties & Record<"--float-rotate", string>
            }
          >
            <p dir="rtl" lang="he" className="text-base font-semibold text-stone-900">
              {w.he}
            </p>
            <p className="text-xs text-stone-500">{w.ru}</p>
          </div>
        ))}

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            Бесплатно · На русском · Без ульпана
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold text-stone-900 sm:text-5xl">
            Иврит, который пригодится с первого дня в Израиле
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
            Тексты, грамматика на русском и карточки с интервальным повторением — учите
            иврит в своём темпе, без очереди в ульпан.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ScrollLink targetId="features" className="btn-primary">
              Начать
            </ScrollLink>
            <Link href="/texts" className="btn-secondary">
              Посмотреть тексты
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Зачем иврит репатрианту</h2>
          <p className="mx-auto mt-2 max-w-2xl text-stone-600">
            В Израиле без иврита тяжело даже с хорошим английским — язык нужен каждый день,
            а не только на экзамене в конце ульпана.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {audience.map(({ Icon, title, description, tone }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold text-stone-900">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Как устроен сайт</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map(({ href, Icon, title, description, tone }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-2xl bg-white p-7 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:-translate-y-0.5 ${toneClasses[tone]}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
              <p className="text-sm text-stone-600">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 font-bold text-white shadow-[0_4px_10px_-2px_rgba(13,151,219,0.5)]">
              {i + 1}
            </span>
            <h3 className="font-semibold text-stone-900">{step.title}</h3>
            <p className="max-w-xs text-sm text-stone-600">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="grid items-center gap-8 rounded-3xl bg-white p-8 shadow-[0_4px_15px_rgba(0,0,0,0.03)] sm:grid-cols-2 sm:p-12">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Почему не просто ульпан</h2>
          <p className="mt-2 text-stone-600">
            Ульпан — это отлично, но группа двигается в своём темпе, а места нужно ждать.
            Этот сайт — то, чем можно пользоваться уже сегодня и параллельно с ульпаном.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2.5 text-stone-700">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center">
        <KnowledgeTree className="pointer-events-none absolute -bottom-10 -right-4 h-[160%] w-auto text-white/10" />
        <KnowledgeTree className="pointer-events-none absolute -bottom-10 -left-16 hidden h-[130%] w-auto -scale-x-100 text-white/10 sm:block" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Начните говорить на иврите уже сегодня</h2>
          <p className="mx-auto mt-2 max-w-lg text-brand-100">
            Регистрация бесплатна и занимает минуту — тексты и грамматика доступны и без неё.
          </p>
          <Link href="/register" className="btn-secondary btn-on-brand mt-6 inline-flex">
            Зарегистрироваться
          </Link>
        </div>
      </section>
    </div>
  );
}
