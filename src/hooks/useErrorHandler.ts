import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/services/chatApi';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        logError = true,
        fallbackMessage = 'An unexpected error occurred',
        onError,
      } = options;

      let errorMessage = fallbackMessage;
      let errorTitle = 'Error';

      if (error instanceof ApiError) {
        errorMessage = error.message;
        
        // Customize based on status code
        switch (error.statusCode) {
          case 401:
            errorTitle = 'Authentication Required';
            errorMessage = 'Please log in to continue';
            break;
          case 403:
            errorTitle = 'Access Denied';
            errorMessage = 'You do not have permission to perform this action';
            break;
          case 404:
            errorTitle = 'Not Found';
            errorMessage = 'The requested resource was not found';
            break;
          case 429:
            errorTitle = 'Rate Limited';
            errorMessage = 'Too many requests. Please wait a moment and try again';
            break;
          case 500:
            errorTitle = 'Server Error';
            errorMessage = 'Our servers are experiencing issues. Please try again later';
            break;
          default:
            if (error.statusCode && error.statusCode >= 500) {
              errorTitle = 'Server Error';
              errorMessage = 'Our servers are experiencing issues. Please try again later';
            }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Log error for debugging
      if (logError) {
        console.error('[ErrorHandler]', {
          error,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      // Show toast notification
      if (showToast) {
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
      }

      // Call custom error handler
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      return {
        title: errorTitle,
        message: errorMessage,
        statusCode: error instanceof ApiError ? error.statusCode : undefined,
      };
    },
    [toast]
  );

  return { handleError };
};