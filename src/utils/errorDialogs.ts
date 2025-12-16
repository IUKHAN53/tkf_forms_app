import { Alert, Platform } from 'react-native';

type ErrorType = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

interface ErrorInfo {
  title: string;
  message: string;
  type: ErrorType;
}

/**
 * Parse API errors and extract meaningful messages
 */
export function parseApiError(error: any): ErrorInfo {
  // Network error (no response)
  if (!error.response) {
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'network',
      };
    }
    if (error.message?.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The server took too long to respond. Please try again.',
        type: 'network',
      };
    }
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      type: 'unknown',
    };
  }

  const status = error.response.status;
  const data = error.response.data;

  // Authentication errors
  if (status === 401) {
    return {
      title: 'Authentication Failed',
      message: data?.message || 'Your session has expired. Please log in again.',
      type: 'auth',
    };
  }

  if (status === 403) {
    return {
      title: 'Access Denied',
      message: data?.message || 'You do not have permission to perform this action.',
      type: 'auth',
    };
  }

  // Validation errors
  if (status === 422) {
    const errors = data?.errors;
    if (errors) {
      const firstError = Object.values(errors)[0];
      const message = Array.isArray(firstError) ? firstError[0] : String(firstError);
      return {
        title: 'Validation Error',
        message: message || 'Please check your input and try again.',
        type: 'validation',
      };
    }
    return {
      title: 'Validation Error',
      message: data?.message || 'Please check your input and try again.',
      type: 'validation',
    };
  }

  // Not found
  if (status === 404) {
    return {
      title: 'Not Found',
      message: data?.message || 'The requested resource was not found.',
      type: 'server',
    };
  }

  // Server errors
  if (status >= 500) {
    return {
      title: 'Server Error',
      message: 'Something went wrong on the server. Please try again later.',
      type: 'server',
    };
  }

  // Generic error
  return {
    title: 'Error',
    message: data?.message || 'An unexpected error occurred. Please try again.',
    type: 'unknown',
  };
}

/**
 * Show an error alert dialog
 */
export function showErrorDialog(
  error: any,
  options?: {
    onRetry?: () => void;
    onDismiss?: () => void;
    customTitle?: string;
    customMessage?: string;
  }
): void {
  const errorInfo = parseApiError(error);
  const title = options?.customTitle || errorInfo.title;
  const message = options?.customMessage || errorInfo.message;

  const buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }> = [];

  if (options?.onRetry) {
    buttons.push({
      text: 'Retry',
      onPress: options.onRetry,
    });
  }

  buttons.push({
    text: 'OK',
    onPress: options?.onDismiss,
    style: 'cancel',
  });

  Alert.alert(title, message, buttons);
}

/**
 * Show a success alert dialog
 */
export function showSuccessDialog(
  title: string,
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onDismiss,
    },
  ]);
}

/**
 * Show a confirmation dialog
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: {
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }
): void {
  Alert.alert(title, message, [
    {
      text: options?.cancelText || 'Cancel',
      onPress: onCancel,
      style: 'cancel',
    },
    {
      text: options?.confirmText || 'Confirm',
      onPress: onConfirm,
      style: options?.destructive ? 'destructive' : 'default',
    },
  ]);
}

/**
 * Show a warning dialog
 */
export function showWarningDialog(
  title: string,
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(`⚠️ ${title}`, message, [
    {
      text: 'OK',
      onPress: onDismiss,
    },
  ]);
}

/**
 * Show offline mode warning
 */
export function showOfflineWarning(): void {
  Alert.alert(
    'You\'re Offline',
    'Your changes will be saved locally and synced when you\'re back online.',
    [{ text: 'OK' }]
  );
}

/**
 * Show sync error dialog
 */
export function showSyncErrorDialog(
  pendingCount: number,
  onRetry?: () => void
): void {
  Alert.alert(
    'Sync Failed',
    `${pendingCount} item${pendingCount > 1 ? 's' : ''} could not be synced. They will be retried automatically when connection is restored.`,
    [
      ...(onRetry ? [{ text: 'Retry Now', onPress: onRetry }] : []),
      { text: 'OK', style: 'cancel' as const },
    ]
  );
}
