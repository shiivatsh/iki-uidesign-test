import { useState, useEffect, useCallback } from 'react';
import { chatApi, ChatThread, ChatStatus } from '@/services/chatApi';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from '@/hooks/use-toast';

export interface UseChatThreadsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface ChatThreadsState {
  threads: ChatThread[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
  error: Error | null;
}

export const useChatThreads = (options: UseChatThreadsOptions) => {
  const { userId, autoRefresh = false, refreshInterval = 30000 } = options;
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  const [state, setState] = useState<ChatThreadsState>({
    threads: [],
    isLoading: false,
    isRefreshing: false,
    lastUpdated: null,
    totalCount: 0,
    currentPage: 1,
    hasMore: false,
    error: null,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<ChatThreadsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load chat threads
  const loadThreads = useCallback(async (
    page: number = 1,
    append: boolean = false,
    showLoading: boolean = true
  ) => {
    try {
      if (showLoading) {
        updateState({ isLoading: !append, isRefreshing: append });
      }

      const result = await chatApi.getUserChats(userId, page, 20);
      
      updateState({
        threads: append ? [...state.threads, ...result.chats] : result.chats,
        totalCount: result.totalCount,
        currentPage: page,
        hasMore: result.chats.length === 20,
        lastUpdated: new Date(),
        isLoading: false,
        isRefreshing: false,
        error: null,
      });

      return result.chats;
    } catch (error) {
      const errorInfo = handleError(error, {
        fallbackMessage: 'Failed to load chat threads',
        showToast: !append, // Only show toast for initial loads
      });
      
      updateState({
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error : new Error(errorInfo.message),
      });
      
      return [];
    }
  }, [userId, state.threads, updateState, handleError]);

  // Load more threads (pagination)
  const loadMore = useCallback(async () => {
    if (state.isLoading || state.isRefreshing || !state.hasMore) return;
    
    await loadThreads(state.currentPage + 1, true);
  }, [state.isLoading, state.isRefreshing, state.hasMore, state.currentPage, loadThreads]);

  // Refresh threads
  const refresh = useCallback(async () => {
    await loadThreads(1, false, false);
  }, [loadThreads]);

  // Update thread status locally
  const updateThreadStatus = useCallback((threadId: string, status: ChatStatus) => {
    updateState({
      threads: state.threads.map(thread =>
        thread.id === threadId
          ? { ...thread, status, updatedAt: new Date().toISOString() }
          : thread
      ),
    });
  }, [state.threads, updateState]);

  // Add new thread to the list
  const addThread = useCallback((newThread: ChatThread) => {
    updateState({
      threads: [newThread, ...state.threads],
      totalCount: state.totalCount + 1,
    });
  }, [state.threads, state.totalCount, updateState]);

  // Remove thread from list
  const removeThread = useCallback((threadId: string) => {
    updateState({
      threads: state.threads.filter(thread => thread.id !== threadId),
      totalCount: Math.max(0, state.totalCount - 1),
    });
  }, [state.threads, state.totalCount, updateState]);

  // Archive thread
  const archiveThread = useCallback(async (threadId: string) => {
    try {
      await chatApi.updateChatStatus(threadId, ChatStatus.ARCHIVED);
      updateThreadStatus(threadId, ChatStatus.ARCHIVED);
      
      toast({
        title: 'Chat Archived',
        description: 'The conversation has been archived',
      });
      
      return true;
    } catch (error) {
      handleError(error, {
        fallbackMessage: 'Failed to archive chat',
      });
      return false;
    }
  }, [updateThreadStatus, toast, handleError]);

  // Get threads by status
  const getThreadsByStatus = useCallback((status: ChatStatus) => {
    return state.threads.filter(thread => thread.status === status);
  }, [state.threads]);

  // Get active threads (not archived)
  const getActiveThreads = useCallback(() => {
    return state.threads.filter(thread => thread.status !== ChatStatus.ARCHIVED);
  }, [state.threads]);

  // Get recent threads
  const getRecentThreads = useCallback((limit: number = 10) => {
    return state.threads
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [state.threads]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadThreads(1);
    }
  }, [userId]); // Only depend on userId to avoid infinite loops

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, refresh]);

  return {
    // State
    ...state,
    
    // Actions
    loadThreads,
    loadMore,
    refresh,
    updateThreadStatus,
    addThread,
    removeThread,
    archiveThread,
    
    // Utilities
    getThreadsByStatus,
    getActiveThreads,
    getRecentThreads,
    hasThreads: state.threads.length > 0,
    canLoadMore: state.hasMore && !state.isLoading && !state.isRefreshing,
  };
};