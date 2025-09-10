import { clsx } from "clsx";
import type { NotificationState } from "../../../hooks/useNotification";
import {
  type NotificationPosition,
  getPositionStyles,
  getTypeStyles,
  getProgressBarStyles,
  notificationContainerStyles,
  iconStyles,
  contentStyles,
  titleStyles,
  messageStyles,
  detailsStyles,
  closeButtonStyles,
} from "./Notification.styles";
import { useCallback } from "react";
import { useRenderCount } from "../../../hooks";

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
  position?: NotificationPosition;
}

export function Notification({
  notification,
  onClose,
  position = "top-right",
}: NotificationProps) {
  if (!notification.show) return null;

  useRenderCount();

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case "success":
        return "Succès";
      case "error":
        return "Erreur";
      case "warning":
        return "Attention";
      case "info":
        return "Information";
      default:
        return "Notification";
    }
  };

  const handleClose = useCallback(() => {
    console.debug("Notification closed");
    onClose();
  }, [onClose]);

  return (
    <div
      className={clsx("notification-popup")}
      style={{
        ...getPositionStyles(position),
        ...getTypeStyles(notification.type),
        ...notificationContainerStyles,
      }}
    >
      <div className={clsx("d-flex", "align-items-start", "gap-sm")}>
        <div style={iconStyles}>{getIcon()}</div>
        <div style={contentStyles}>
          <div style={titleStyles}>{getTitle()}</div>
          <div style={messageStyles}>{notification.message}</div>
          {notification.details && (
            <div style={detailsStyles}>{notification.details}</div>
          )}
        </div>
        <button
          onClick={handleClose}
          style={closeButtonStyles}
          aria-label="Fermer la notification"
        >
          ×
        </button>
      </div>
      {notification.duration && (
        <div
          style={getProgressBarStyles(notification.type, notification.duration)}
        />
      )}
    </div>
  );
}
