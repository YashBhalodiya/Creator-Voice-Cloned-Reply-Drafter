export interface StyleFeatures {
  avgCharLength: number;
  avgWordLength: number;
  emojiDensity: number;
  punctuationStyle: string;
  formality: 'formal' | 'informal';
}

export interface Creator {
  id: string;
  name: string;
  persona: string;
  styleFeatures: StyleFeatures | null;
}

export interface Question {
  id: string;
  creatorId: string;
  question: string;
  createdAt: string;
}

export interface Draft {
  id: string;
  creatorId: string;
  questionId: string;
  draft: string;
  rank: number;
  reasoning: string;
  similarityScore?: number;
}

export interface Evaluation {
  id: string;
  creatorName: string;
  score: number;
  feedback: string;
  date: string;
}

// Emptied mock data lists for a clean starting application state
export const MOCK_CREATORS: Creator[] = [];

export const MOCK_REPLIES: Record<string, string[]> = {};

export const MOCK_QUESTIONS: Record<string, Question[]> = {};

export const MOCK_DRAFTS: Record<string, Draft[]> = {};

export const MOCK_EVALUATION_REPORT = {
  passedCount: 0,
  totalCount: 0,
  passPercentage: 0,
  crossContaminationPercentage: 0,
  history: []
};
