import { Creator, StyleFeatures, Question, Draft, Evaluation } from '@/constants/mockData';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  
  // Get host machine IP from Expo dev server if available
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  
  // Fallbacks: 10.0.2.2 for Android emulators, localhost for iOS simulators
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const API_BASE_URL = getBaseUrl();

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {
      // JSON parsing failed, use generic message
    }
    throw new Error(errorMessage);
  }
  const result = await response.json();
  return result.data as T;
}

export const api = {
  /**
   * Get all creator profiles
   */
  async getCreators(): Promise<Creator[]> {
    const res = await fetch(`${API_BASE_URL}/creator`);
    return handleResponse<Creator[]>(res);
  },

  /**
   * Create a new creator profile
   */
  async createCreator(name: string, persona: string): Promise<Creator> {
    const res = await fetch(`${API_BASE_URL}/creator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, persona }),
    });
    return handleResponse<Creator>(res);
  },

  /**
   * Bulk import past replies to extract style features
   */
  async ingestReplies(creatorId: string, replies: string[]): Promise<{ importedCount: number }> {
    const res = await fetch(`${API_BASE_URL}/replies/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId, texts: replies }),
    });
    return handleResponse<{ importedCount: number }>(res);
  },

  /**
   * Fetch replies for a creator
   */
  async getReplies(creatorId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/replies/${creatorId}`);
    return handleResponse<any[]>(res);
  },

  /**
   * Submit an audience question
   */
  async submitQuestion(creatorId: string, question: string): Promise<Question> {
    const res = await fetch(`${API_BASE_URL}/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId, question }),
    });
    return handleResponse<Question>(res);
  },

  /**
   * Fetch questions for a creator
   */
  async getQuestions(creatorId: string): Promise<Question[]> {
    const res = await fetch(`${API_BASE_URL}/question/${creatorId}`);
    return handleResponse<Question[]>(res);
  },

  /**
   * Generate voice-cloned draft replies for a question using RAG
   */
  async generateDrafts(creatorId: string, questionId: string): Promise<Draft[]> {
    const res = await fetch(`${API_BASE_URL}/draft/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId, questionId }),
    });
    return handleResponse<Draft[]>(res);
  },

  /**
   * Log an evaluation for a draft response
   */
  async submitEvaluation(creatorId: string, score: number, feedback: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId, score, feedback }),
    });
    return handleResponse<any>(res);
  },

  /**
   * Get all logged evaluations
   */
  async getEvaluations(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/evaluation`);
    return handleResponse<any[]>(res);
  },

  /**
   * Clear all evaluation logs
   */
  async clearEvaluations(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/evaluation`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  }
};
