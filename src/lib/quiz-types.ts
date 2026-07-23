export type QuizQuestion =
  | { id: string; type: "MULTIPLE_CHOICE"; prompt: string; options: string[] }
  | { id: string; type: "TRUE_FALSE"; prompt: string }
  | { id: string; type: "FILL_BLANK"; prompt: string }
  | { id: string; type: "ORDERING"; prompt: string; items: string[] };

export type QuizAnswerValue = number | boolean | string | string[] | null;

export type QuizResultItem = {
  questionId: string;
  correct: boolean;
  correctIndex?: number;
  correctBool?: boolean;
  correctText?: string;
  correctOrder?: string[];
};

export type QuizResult = {
  score: number;
  total: number;
  results: QuizResultItem[];
  saved: boolean;
};
