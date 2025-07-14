import axios, { AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = 'https://ikiru-backend-515600662686.us-central1.run.app';

// Data Types based on Phase 2 specifications
export interface Message {
  id: string;
  chatId: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  metadata?: {
    messageType?: 'text' | 'booking_request' | 'confirmation';
    bookingDetails?: any;
  };
}

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  messageCount: number;
  metadata?: {
    serviceType?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

export interface Booking {
  id: string;
  chatId: string;
  userId: string;
  serviceType: string;
  scheduledDate?: string;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  details: {
    description: string;
    address?: string;
    requirements?: string[];
    estimatedDuration?: number;
    price?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export enum ChatStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface ChatListResponse {
  chats: ChatThread[];
  totalCount: number;
  page: number;
  limit: number;
}

interface MessageResponse {
  message: Message;
  chatStatus: ChatStatus;
  suggestedActions?: string[];
}

// API Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry logic for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<AxiosResponse<T>> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
};

const isRetryableError = (error: any): boolean => {
  const status = error?.response?.status;
  return !status || status >= 500 || status === 429;
};

// Chat API Service
export class ChatApiService {
  private static instance: ChatApiService;
  private token: string | null = null;

  private constructor() {
    // Initialize with stored auth token if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ikiru_dashboard_token');
    }
  }

  public static getInstance(): ChatApiService {
    if (!ChatApiService.instance) {
      ChatApiService.instance = new ChatApiService();
    }
    return ChatApiService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  // Create new chat thread
  async createNewChat(
    userId: string,
    initialMessage?: string,
    serviceType?: string
  ): Promise<{ chat: ChatThread; message?: Message }> {
    try {
      const response = await retryRequest(() =>
        axios.post<ApiResponse<{ chat: ChatThread; message?: Message }>>(
          `${API_BASE_URL}/api/chats/new`,
          {
            userId,
            initialMessage,
            serviceType,
            metadata: {
              source: 'web_app',
              timestamp: new Date().toISOString(),
            },
          },
          { headers: this.getHeaders() }
        )
      );

      if (!response.data.success) {
        throw new ApiError(response.data.error || 'Failed to create chat');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new ApiError('Authentication required', 401);
      }
      if (error.response?.status === 429) {
        throw new ApiError('Rate limit exceeded. Please wait a moment.', 429);
      }
      throw new ApiError(
        error.response?.data?.error || 'Failed to create new chat',
        error.response?.status
      );
    }
  }

  // Send message to existing chat
  async sendMessage(
    chatId: string,
    content: string,
    messageType: 'text' | 'booking_request' = 'text'
  ): Promise<MessageResponse> {
    try {
      const response = await retryRequest(() =>
        axios.put<ApiResponse<MessageResponse>>(
          `${API_BASE_URL}/api/chats/${chatId}/message`,
          {
            content,
            messageType,
            timestamp: new Date().toISOString(),
          },
          { headers: this.getHeaders() }
        )
      );

      if (!response.data.success) {
        throw new ApiError(response.data.error || 'Failed to send message');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError('Chat not found', 404);
      }
      if (error.response?.status === 429) {
        throw new ApiError('Rate limit exceeded. Please wait a moment.', 429);
      }
      throw new ApiError(
        error.response?.data?.error || 'Failed to send message',
        error.response?.status
      );
    }
  }

  // Get all chats for a user
  async getUserChats(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: ChatStatus
  ): Promise<ChatListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await retryRequest(() =>
        axios.get<ApiResponse<ChatListResponse>>(
          `${API_BASE_URL}/api/chats/${userId}?${params}`,
          { headers: this.getHeaders() }
        )
      );

      if (!response.data.success) {
        throw new ApiError(response.data.error || 'Failed to fetch chats');
      }

      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error || 'Failed to fetch chats',
        error.response?.status
      );
    }
  }

  // Update chat status
  async updateChatStatus(
    chatId: string,
    status: ChatStatus,
    metadata?: any
  ): Promise<ChatThread> {
    try {
      const response = await retryRequest(() =>
        axios.put<ApiResponse<ChatThread>>(
          `${API_BASE_URL}/api/chats/${chatId}/status`,
          {
            status,
            metadata,
            updatedAt: new Date().toISOString(),
          },
          { headers: this.getHeaders() }
        )
      );

      if (!response.data.success) {
        throw new ApiError(response.data.error || 'Failed to update chat status');
      }

      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error || 'Failed to update chat status',
        error.response?.status
      );
    }
  }

  // Resume existing chat
  async resumeChat(chatId: string): Promise<{ chat: ChatThread; messages: Message[] }> {
    try {
      const response = await retryRequest(() =>
        axios.get<ApiResponse<{ chat: ChatThread; messages: Message[] }>>(
          `${API_BASE_URL}/api/chats/${chatId}/resume`,
          { headers: this.getHeaders() }
        )
      );

      if (!response.data.success) {
        throw new ApiError(response.data.error || 'Failed to resume chat');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError('Chat not found', 404);
      }
      throw new ApiError(
        error.response?.data?.error || 'Failed to resume chat',
        error.response?.status
      );
    }
  }

  // Legacy LLM endpoint for backward compatibility
  async askLLM(trackingCode: string, question: string): Promise<string> {
    try {
      const response = await retryRequest(() =>
        axios.post(
          `${API_BASE_URL}/ask-llm`,
          {
            tracking_code: trackingCode,
            question,
          },
          { headers: this.getHeaders() }
        )
      );

      return response.data.response || 'No response received';
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error || 'Failed to get AI response',
        error.response?.status
      );
    }
  }

  // Update authentication token
  setAuthToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('ikiru_dashboard_token', token);
      } else {
        localStorage.removeItem('ikiru_dashboard_token');
      }
    }
  }
}

// Export singleton instance
export const chatApi = ChatApiService.getInstance();