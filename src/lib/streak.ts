import { prisma } from "@/lib/prisma";

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Registers a day of activity for the user (finished a text task or studied
 * at least one flashcard). Idempotent within a single calendar day.
 */
export async function registerActivity(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });
  if (!user) return;

  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const lastStart = user.lastActiveDate ? startOfUtcDay(user.lastActiveDate) : null;

  if (lastStart === todayStart) {
    // Already registered today, nothing to do.
    return;
  }

  const diffDays = lastStart === null ? null : Math.round((todayStart - lastStart) / 86_400_000);
  const nextStreak = diffDays === 1 ? user.currentStreak + 1 : 1;
  const nextLongest = Math.max(user.longestStreak, nextStreak);

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: nextStreak,
      longestStreak: nextLongest,
      lastActiveDate: now,
    },
  });
}

/**
 * The stored `currentStreak` only updates when the user registers activity,
 * so it stays stuck at its last value between visits. This derives the
 * streak actually in effect right now — burned back to 0 once a full
 * calendar day has passed with no activity (visits "yesterday" still keep
 * the streak alive since today isn't over yet).
 */
export function getEffectiveStreak(currentStreak: number, lastActiveDate: Date | null): number {
  if (!lastActiveDate) return 0;

  const diffDays = Math.round((startOfUtcDay(new Date()) - startOfUtcDay(lastActiveDate)) / 86_400_000);
  return diffDays <= 1 ? currentStreak : 0;
}
