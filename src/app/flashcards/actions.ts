"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { registerActivity } from "@/lib/streak";
import { scheduleNextReview } from "@/lib/sm2";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user.id;
}

async function requireTopicOwner(topicId: string, userId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic || topic.userId !== userId) redirect("/flashcards");
  return topic;
}

export async function createTopic(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.topic.create({ data: { name, userId } });
  revalidatePath("/flashcards");
}

export async function deleteTopic(topicId: string) {
  const userId = await requireUserId();
  await requireTopicOwner(topicId, userId);

  await prisma.topic.delete({ where: { id: topicId } });
  revalidatePath("/flashcards");
}

export async function createCard(topicId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireTopicOwner(topicId, userId);

  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  if (!front || !back) return;

  await prisma.card.create({ data: { topicId, front, back } });
  revalidatePath(`/flashcards/${topicId}`);
}

export async function updateCard(cardId: string, formData: FormData) {
  const userId = await requireUserId();
  const card = await prisma.card.findUnique({ where: { id: cardId }, include: { topic: true } });
  if (!card || card.topic.userId !== userId) redirect("/flashcards");

  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  if (!front || !back) return;

  await prisma.card.update({ where: { id: cardId }, data: { front, back } });
  revalidatePath(`/flashcards/${card.topicId}`);
}

export async function deleteCard(cardId: string) {
  const userId = await requireUserId();
  const card = await prisma.card.findUnique({ where: { id: cardId }, include: { topic: true } });
  if (!card || card.topic.userId !== userId) redirect("/flashcards");

  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/flashcards/${card.topicId}`);
}

export async function reviewCard(cardId: string, quality: 1 | 3 | 4 | 5) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const card = await prisma.card.findUnique({ where: { id: cardId }, include: { topic: true } });
  if (!card || card.topic.userId !== session.user.id) redirect("/flashcards");

  const next = scheduleNextReview(
    { repetitions: card.repetitions, easeFactor: card.easeFactor, interval: card.interval },
    quality,
  );

  await prisma.card.update({
    where: { id: cardId },
    data: {
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      interval: next.interval,
      dueDate: next.dueDate,
      lastReviewedAt: new Date(),
    },
  });

  await registerActivity(session.user.id);
  revalidatePath(`/flashcards/${card.topicId}`);
}
