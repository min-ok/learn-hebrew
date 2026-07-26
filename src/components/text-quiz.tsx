"use client";

import { useState } from "react";
import { submitTextAttempt } from "@/app/texts/actions";
import type { QuizAnswerValue, QuizQuestion, QuizResult } from "@/lib/quiz-types";

const TYPE_LABEL: Record<QuizQuestion["type"], string> = {
  MULTIPLE_CHOICE: "Выберите ответ",
  TRUE_FALSE: "Правда или ложь",
  FILL_BLANK: "Вставьте слово",
  ORDERING: "Соберите предложение",
};

function initialAnswer(type: QuizQuestion["type"]): QuizAnswerValue {
  switch (type) {
    case "FILL_BLANK":
      return "";
    case "ORDERING":
      return [];
    default:
      return null;
  }
}

function isAnswered(question: QuizQuestion, answer: QuizAnswerValue) {
  switch (question.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
      return answer !== null;
    case "FILL_BLANK":
      return typeof answer === "string" && answer.trim().length > 0;
    case "ORDERING":
      return Array.isArray(answer) && answer.length === question.items.length;
  }
}

type QuestionBlock = {
  type: QuizQuestion["type"];
  entries: { question: QuizQuestion; index: number }[];
};

// Groups consecutive same-type questions into one exercise block (British
// Council style: one instruction header per task, not repeated per question).
function groupIntoBlocks(questions: QuizQuestion[]): QuestionBlock[] {
  const blocks: QuestionBlock[] = [];
  questions.forEach((question, index) => {
    const last = blocks[blocks.length - 1];
    if (last && last.type === question.type) {
      last.entries.push({ question, index });
    } else {
      blocks.push({ type: question.type, entries: [{ question, index }] });
    }
  });
  return blocks;
}

export function TextQuiz({ textId, questions }: { textId: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<QuizAnswerValue[]>(() =>
    questions.map((q) => initialAnswer(q.type)),
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const allAnswered = questions.every((q, i) => isAnswered(q, answers[i]));

  function setAnswer(index: number, value: QuizAnswerValue) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  async function handleSubmit() {
    setLoading(true);
    const res = await submitTextAttempt(textId, answers);
    setResult(res);
    setLoading(false);
  }

  function handleRetry() {
    setAnswers(questions.map((q) => initialAnswer(q.type)));
    setResult(null);
    setAttempt((a) => a + 1);
  }

  const blocks = groupIntoBlocks(questions);

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, blockIndex) => (
        <div key={blockIndex} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
            Задание {blockIndex + 1}. {TYPE_LABEL[block.type]}
          </h3>
          <div className="flex flex-col gap-3">
            {block.entries.map(({ question, index }) => (
              <QuestionCard
                key={`${question.id}-${attempt}`}
                index={index}
                question={question}
                answer={answers[index]}
                onChange={(value) => setAnswer(index, value)}
                resultItem={result?.results[index]}
                locked={!!result}
              />
            ))}
          </div>
        </div>
      ))}

      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="btn-primary self-start"
        >
          {loading ? "Проверяем…" : "Проверить ответы"}
        </button>
      ) : (
        <div className="animate-fade-in-up flex flex-col gap-2 rounded-xl bg-brand-50 p-4 dark:bg-brand-950">
          <p className="font-semibold text-brand-900 dark:text-brand-300">
            Результат: {result.score} из {result.total}
          </p>
          {!result.saved && (
            <p className="text-sm text-brand-800 dark:text-brand-400">
              Зарегистрируйтесь, чтобы сохранять прогресс и стрик.
            </p>
          )}
          <button
            onClick={handleRetry}
            className="btn-secondary btn-sm self-start"
          >
            Пройти ещё раз
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  index,
  question,
  answer,
  onChange,
  resultItem,
  locked,
}: {
  index: number;
  question: QuizQuestion;
  answer: QuizAnswerValue;
  onChange: (value: QuizAnswerValue) => void;
  resultItem: QuizResult["results"][number] | undefined;
  locked: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-stone-400 dark:text-stone-600">{index + 1}</span>
        {resultItem && (
          <span className={resultItem.correct ? "text-sm text-green-600" : "text-sm text-red-600"}>
            {resultItem.correct ? "Верно" : "Неверно"}
          </span>
        )}
      </div>

      {question.type === "MULTIPLE_CHOICE" && (
        <MultipleChoiceBody question={question} answer={answer} onChange={onChange} resultItem={resultItem} locked={locked} />
      )}
      {question.type === "TRUE_FALSE" && (
        <TrueFalseBody question={question} answer={answer} onChange={onChange} resultItem={resultItem} locked={locked} />
      )}
      {question.type === "FILL_BLANK" && (
        <FillBlankBody question={question} answer={answer} onChange={onChange} resultItem={resultItem} locked={locked} />
      )}
      {question.type === "ORDERING" && (
        <OrderingBody question={question} onChange={onChange} resultItem={resultItem} locked={locked} />
      )}
    </div>
  );
}

function MultipleChoiceBody({
  question,
  answer,
  onChange,
  resultItem,
  locked,
}: {
  question: Extract<QuizQuestion, { type: "MULTIPLE_CHOICE" }>;
  answer: QuizAnswerValue;
  onChange: (value: QuizAnswerValue) => void;
  resultItem: QuizResult["results"][number] | undefined;
  locked: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-stone-900 dark:text-stone-100">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, oIndex) => {
          const isSelected = answer === oIndex;
          const isCorrectOption = resultItem && resultItem.correctIndex === oIndex;
          const isWrongSelected = resultItem && isSelected && !resultItem.correct;

          return (
            <label
              key={oIndex}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                isCorrectOption
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : isWrongSelected
                    ? "border-red-500 bg-red-50 dark:bg-red-950"
                    : "border-stone-200 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                disabled={locked}
                checked={isSelected}
                onChange={() => onChange(oIndex)}
                className="accent-brand-700"
              />
              <span className="text-stone-800 dark:text-stone-200">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TrueFalseBody({
  question,
  answer,
  onChange,
  resultItem,
  locked,
}: {
  question: Extract<QuizQuestion, { type: "TRUE_FALSE" }>;
  answer: QuizAnswerValue;
  onChange: (value: QuizAnswerValue) => void;
  resultItem: QuizResult["results"][number] | undefined;
  locked: boolean;
}) {
  const options: { label: string; value: boolean }[] = [
    { label: "Правда", value: true },
    { label: "Ложь", value: false },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p dir="rtl" lang="he" className="text-right text-lg text-stone-900 dark:text-stone-100">
        {question.prompt}
      </p>
      <div className="flex gap-2">
        {options.map((option) => {
          const isSelected = answer === option.value;
          const isCorrectOption = resultItem && resultItem.correctBool === option.value;
          const isWrongSelected = resultItem && isSelected && !resultItem.correct;

          return (
            <button
              key={option.label}
              type="button"
              disabled={locked}
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:cursor-default ${
                isCorrectOption
                  ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : isWrongSelected
                    ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
                    : isSelected
                      ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillBlankBody({
  question,
  answer,
  onChange,
  resultItem,
  locked,
}: {
  question: Extract<QuizQuestion, { type: "FILL_BLANK" }>;
  answer: QuizAnswerValue;
  onChange: (value: QuizAnswerValue) => void;
  resultItem: QuizResult["results"][number] | undefined;
  locked: boolean;
}) {
  const parts = question.prompt.split("___");
  const value = typeof answer === "string" ? answer : "";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-stone-500 dark:text-stone-400">Впишите пропущенное слово</p>
      <div dir="rtl" lang="he" className="flex flex-wrap items-center gap-2 text-lg text-stone-900 dark:text-stone-100">
        <span>{parts[0]}</span>
        <input
          type="text"
          dir="rtl"
          lang="he"
          disabled={locked}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-32 rounded-lg border px-2 py-1 text-center text-lg outline-none focus:border-brand-600 dark:bg-stone-950 ${
            resultItem
              ? resultItem.correct
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950"
              : "border-stone-300 dark:border-stone-700"
          }`}
        />
        <span>{parts[1] ?? ""}</span>
      </div>
      {resultItem && !resultItem.correct && (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Правильный ответ:{" "}
          <span dir="rtl" lang="he" className="font-medium text-stone-900 dark:text-stone-100">
            {resultItem.correctText}
          </span>
        </p>
      )}
    </div>
  );
}

function OrderingBody({
  question,
  onChange,
  resultItem,
  locked,
}: {
  question: Extract<QuizQuestion, { type: "ORDERING" }>;
  onChange: (value: QuizAnswerValue) => void;
  resultItem: QuizResult["results"][number] | undefined;
  locked: boolean;
}) {
  // Tracked by index (not word) so duplicate words behave correctly.
  // Resets on retry because the parent remounts this component with a new key.
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const selectedWords = selectedIndices.map((i) => question.items[i]);
  const poolIndices = question.items
    .map((_, i) => i)
    .filter((i) => !selectedIndices.includes(i));

  function pick(itemIndex: number) {
    if (locked) return;
    const next = [...selectedIndices, itemIndex];
    setSelectedIndices(next);
    onChange(next.map((i) => question.items[i]));
  }

  function remove(posInSelected: number) {
    if (locked) return;
    const next = selectedIndices.filter((_, i) => i !== posInSelected);
    setSelectedIndices(next);
    onChange(next.map((i) => question.items[i]));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-500 dark:text-stone-400">{question.prompt}</p>

      <div
        dir="rtl"
        lang="he"
        className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-950"
      >
        {selectedWords.length === 0 && (
          <span className="text-sm text-stone-400 dark:text-stone-600">Нажимайте на слова снизу по порядку</span>
        )}
        {selectedWords.map((word, i) => {
          const isCorrectSlot = resultItem?.correctOrder && resultItem.correctOrder[i] === word;
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => remove(i)}
              className={`rounded-lg border px-3 py-1.5 text-lg transition disabled:cursor-default ${
                resultItem
                  ? isCorrectSlot
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {!locked && (
        <div dir="rtl" lang="he" className="flex flex-wrap gap-2">
          {poolIndices.map((itemIndex) => (
            <button
              key={itemIndex}
              type="button"
              onClick={() => pick(itemIndex)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-lg text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {question.items[itemIndex]}
            </button>
          ))}
        </div>
      )}

      {resultItem && !resultItem.correct && resultItem.correctOrder && (
        <p dir="rtl" lang="he" className="text-lg text-stone-700 dark:text-stone-300">
          Правильный порядок: {resultItem.correctOrder.join(" ")}
        </p>
      )}
    </div>
  );
}
