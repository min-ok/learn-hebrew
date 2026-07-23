export type Sm2State = {
  repetitions: number;
  easeFactor: number;
  interval: number;
};

export type Sm2Result = Sm2State & { dueDate: Date };

/**
 * SuperMemo-2 spaced repetition scheduler.
 * quality: 1 = "снова", 3 = "трудно", 4 = "хорошо", 5 = "легко"
 */
export function scheduleNextReview(state: Sm2State, quality: 1 | 3 | 4 | 5, now = new Date()): Sm2Result {
  let { repetitions, easeFactor, interval } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + interval);

  return { repetitions, easeFactor, interval, dueDate };
}
