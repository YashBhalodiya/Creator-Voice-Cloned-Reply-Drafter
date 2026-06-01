import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Creator, StyleFeatures } from '@/constants/mockData';
import { api } from '@/services/api';

export interface AppContextType {
  activeCreator: Creator | null;
  setActiveCreator: (creator: Creator | null) => void;
  creatorsList: Creator[];
  setCreatorsList: React.Dispatch<React.SetStateAction<Creator[]>>;
  evaluations: any[];
  addEvaluation: (evaluation: { score: number; feedback: string }) => Promise<void>;
  resetEvaluations: () => Promise<void>;
  updateCreatorStyle: (creatorId: string, style: any, replies: string[]) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshCreators: () => Promise<void>;
  refreshEvaluations: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [creatorsList, setCreatorsList] = useState<Creator[]>([]);
  const [activeCreator, setActiveCreatorState] = useState<Creator | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync active creator with the latest entry in creatorsList (e.g. after styles are updated)
  const setActiveCreator = useCallback((creator: Creator | null) => {
    if (!creator) {
      setActiveCreatorState(null);
      return;
    }
    setActiveCreatorState(creator);
  }, []);

  const refreshCreators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const creators = await api.getCreators();
      setCreatorsList(creators);
      
      // Update active creator references
      setActiveCreatorState(prev => {
        if (!prev) return null;
        const fresh = creators.find(c => c.id === prev.id);
        return fresh || prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creators');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const evals = await api.getEvaluations();
      setEvaluations(evals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading
  useEffect(() => {
    refreshCreators();
    refreshEvaluations();
  }, [refreshCreators, refreshEvaluations]);

  const addEvaluation = async (evaluation: { score: number; feedback: string }) => {
    if (!activeCreator) return;
    setLoading(true);
    setError(null);
    try {
      await api.submitEvaluation(activeCreator.id, evaluation.score, evaluation.feedback);
      await refreshEvaluations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  const resetEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.clearEvaluations();
      setEvaluations([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear evaluations');
    } finally {
      setLoading(false);
    }
  };

  const updateCreatorStyle = async (creatorId: string, style: any, replies: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await api.ingestReplies(creatorId, replies);
      await refreshCreators();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze replies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeCreator,
        setActiveCreator,
        creatorsList,
        setCreatorsList,
        evaluations,
        addEvaluation,
        resetEvaluations,
        updateCreatorStyle,
        loading,
        error,
        refreshCreators,
        refreshEvaluations
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

export default AppContext;
