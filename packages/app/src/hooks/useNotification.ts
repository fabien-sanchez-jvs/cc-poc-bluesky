import { useState, useEffect, useCallback } from "react";

export interface NotificationState {
  show: boolean;
  type: "success" | "error" | "info" | "warning";
  message: string;
  details?: string;
  duration?: number; // en millisecondes
}

export function useNotification(defaultDuration: number = 60000) {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "info",
    message: "",
  });

  const showNotification = useCallback(
    (
      type: NotificationState["type"],
      message: string,
      details?: string,
      duration?: number
    ) => {
      setNotification({
        show: true,
        type,
        message,
        details,
        duration: duration || defaultDuration,
      });
    },
    [defaultDuration]
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  // Auto-masquer la notification après la durée spécifiée
  useEffect(() => {
    if (notification.show && notification.duration) {
      const timer = setTimeout(() => {
        hideNotification();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.duration, hideNotification]);

  const showSuccess = useCallback(
    (message: string, details?: string, duration?: number) =>
      showNotification("success", message, details, duration),
    [showNotification]
  );

  const showError = useCallback(
    (message: string, details?: string, duration?: number) =>
      showNotification("error", message, details, duration),
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, details?: string, duration?: number) =>
      showNotification("info", message, details, duration),
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, details?: string, duration?: number) =>
      showNotification("warning", message, details, duration),
    [showNotification]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
