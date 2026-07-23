"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { registerActivity } from "@/lib/streak";
import type { QuizAnswerValue, QuizResult, QuizResultItem } from "@/lib/quiz-types";

function normalize(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function gradeQuestion(
  question: {
    type: string;
    correctIndex: number | null;
    correctBool: boolean | null;
    correctText: string | null;
    options: string | null;
  },
  answer: QuizAnswerValue,
): { correct: boolean; item: Omit<QuizResultItem, "questionId"> } {
  switch (question.type) {
    case "MULTIPLE_CHOICE": {
      const correct = answer === question.correctIndex;
      return { correct, item: { correct, correctIndex: question.correctIndex ?? undefined } };
    }
    case "TRUE_FALSE": {
      const correct = answer === question.correctBool;
      return { correct, item: { correct, correctBool: question.correctBool ?? undefined } };
    }
    case "FILL_BLANK": {
      const correct =
        typeof answer === "string" &&
        !!question.correctText &&
        normalize(answer).toLowerCase() === normalize(question.correctText).toLowerCase();
      return { correct, item: { correct, correctText: question.correctText ?? undefined } };
    }
    case "ORDERING": {
      const correctOrder = question.options ? (JSON.parse(question.options) as string[]) : [];
      const correct =
        Array.isArray(answer) &&
        answer.length === correctOrder.length &&
        answer.every((value, index) => value === correctOrder[index]);
      return { correct, item: { correct, correctOrder } };
    }
    default:
      return { correct: false, item: { correct: false } };
  }
}

export async function submitTextAttempt(
  textId: string,
  answers: QuizAnswerValue[],
): Promise<QuizResult> {
  const questions = await prisma.question.findMany({
    where: { textId },
    orderBy: { order: "asc" },
  });

  let score = 0;
  const results: QuizResultItem[] = questions.map((question, index) => {
    const { correct, item } = gradeQuestion(question, answers[index] ?? null);
    if (correct) score += 1;
    return { questionId: question.id, ...item };
  });

  const session = await auth();
  let saved = false;

  if (session?.user) {
    await prisma.textAttempt.create({
      data: {
        userId: session.user.id,
        textId,
        score,
        total: questions.length,
      },
    });
    await registerActivity(session.user.id);
    saved = true;
  }

  return { score, total: questions.length, results, saved };
}
