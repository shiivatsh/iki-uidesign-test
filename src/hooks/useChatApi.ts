import { useState, useCallback, useRef, useEffect } from 'react';
import { chatApi, ChatThread, Message, ChatStatus, ApiError } from '@/services/chatApi';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from '@/hooks/use-toast';

export interface UseChatApiOptions {
  userId: string;
  onChatCreated?: (chat: ChatThread) => void;
  onMessageSent?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface ChatState {
  currentChat: ChatThread | null;
  messages: Message[];
  isLoading: boolean;
  isConnecting: boolean;
  lastError: Error | null;
}

export const useChatApi = (options: UseChatApiOptions) => {
  const { userId, onChatCreated, onMessageSent, onError } = options;
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  // State management
  const [state, setState] = useState<ChatState>({
    currentChat: null,
    messages: [],
    isLoading: false,
    isConnecting: false,
    lastError: null,
  });

  // Refs for tracking
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Update state helper
  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Create new chat
  const createNewChat = useCallback(async (
    initialMessage?: string,
    serviceType?: string
  ): Promise<ChatThread | null> => {
    try {
      updateState({ isConnecting: true, lastError: null });

      const result = await chatApi.createNewChat(userId, initialMessage, serviceType);
      
      updateState({ 
        currentChat: result.chat,
        messages: result.message ? [result.message] : [],
        isConnecting: false 
      });

      toast({
        title: 'Chat Created',
        description: 'New conversation started successfully',
      });

      onChatCreated?.(result.chat);
      return result.chat;

    } catch (error) {
      const errorInfo = handleError(error, {
        fallbackMessage: 'Failed to create new chat',
        onError,
      });
      
      updateState({ 
        isConnecting: false, 
        lastError: error instanceof Error ? error : new Error(errorInfo.message) 
      });
      
      return null;
    }
  }, [userId, updateState, handleError, toast, onChatCreated, onError]);

  // Send message with retry logic
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'booking_request' = 'text'
  ): Promise<Message | null> => {
    if (!state.currentChat) {
      // Auto-create chat if none exists
      const newChat = await createNewChat(content);
      if (!newChat) return null;
    }

    try {
      updateState({ isLoading: true, lastError: null });

      // Add optimistic user message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId: state.currentChat!.id,
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      updateState({ 
        messages: [...state.messages, optimisticMessage]
      });

      const response = await chatApi.sendMessage(
        state.currentChat!.id,
        content,
        messageType
      );

      // Replace optimistic message and add AI response
      updateState({ 
        messages: [
          ...state.messages.filter(m => m.id !== optimisticMessage.id),
          {
            ...optimisticMessage,
            id: `user-${Date.now()}`,
          },
          response.message
        ],
        isLoading: false,
        currentChat: {
          ...state.currentChat!,
          status: response.chatStatus,
          updatedAt: new Date().toISOString(),
        }
      });

      onMessageSent?.(response.message);
      retryCountRef.current = 0; // Reset retry count on success

      return response.message;

    } catch (error) {
      // Remove optimistic message on error
      updateState({ 
        messages: state.messages.filter(m => !m.id.startsWith('temp-')),
        isLoading: false 
      });

      // Retry logic for network errors
      if (retryCountRef.current < maxRetries && 
          (error instanceof ApiError && error.statusCode && error.statusCode >= 500)) {
        retryCountRef.current++;
        
        toast({
          title: 'Connection Issue',
          description: `Retrying... (${retryCountRef.current}/${maxRetries})`,
        });

        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retryCountRef.current) * 1000)
        );

        return sendMessage(content, messageType);
      }

      const errorInfo = handleError(error, {
        fallbackMessage: 'Failed to send message',
        onError,
      });
      
      updateState({ 
        lastError: error instanceof Error ? error : new Error(errorInfo.message) 
      });
      
      return null;
    }
  }, [state.currentChat, state.messages, updateState, handleError, toast, onMessageSent, onError, createNewChat]);

  // Resume existing chat
  const resumeChat = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      updateState({ isConnecting: true, lastError: null });

      const result = await chatApi.resumeChat(chatId);
      
      updateState({ 
        currentChat: result.chat,
        messages: result.messages,
        isConnecting: false 
      });

      toast({
        title: 'Chat Resumed',
        description: 'Previous conversation loaded successfully',
      });

      return true;

    } catch (error) {
      const errorInfo = handleError(error, {
        fallbackMessage: 'Failed to resume chat',
        onError,
      });
      
      updateState({ 
        isConnecting: false, 
        lastError: error instanceof Error ? error : new Error(errorInfo.message) 
      });
      
      return false;
    }
  }, [updateState, handleError, toast, onError]);

  // Update chat status
  const updateChatStatus = useCallback(async (
    status: ChatStatus,
    metadata?: any
  ): Promise<boolean> => {
    if (!state.currentChat) return false;

    try {
      const updatedChat = await chatApi.updateChatStatus(
        state.currentChat.id,
        status,
        metadata
      );
      
      updateState({ 
        currentChat: updatedChat 
      });

      return true;

    } catch (error) {
      handleError(error, {
        fallbackMessage: 'Failed to update chat status',
        onError,
      });
      
      return false;
    }
  }, [state.currentChat, updateState, handleError, onError]);

  // Clear current chat
  const clearChat = useCallback(() => {
    updateState({
      currentChat: null,
      messages: [],
      isLoading: false,
      isConnecting: false,
      lastError: null,
    });
    retryCountRef.current = 0;
  }, [updateState]);

  // Legacy support for existing chat interface
  const sendLegacyMessage = useCallback(async (
    trackingCode: string,
    question: string
  ): Promise<string | null> => {
    try {
      updateState({ isLoading: true, lastError: null });
      const response = await chatApi.askLLM(trackingCode, question);
      updateState({ isLoading: false });
      return response;
    } catch (error) {
      handleError(error, {
        fallbackMessage: 'Failed to get AI response',
        onError,
      });
      updateState({ isLoading: false });
      return null;
    }
  }, [updateState, handleError, onError]);

  return {
    // State
    ...state,
    
    // Actions
    createNewChat,
    sendMessage,
    resumeChat,
    updateChatStatus,
    clearChat,
    sendLegacyMessage,
    
    // Utilities
    hasActiveChat: !!state.currentChat,
    canSendMessage: !state.isLoading && !state.isConnecting,
  };
};