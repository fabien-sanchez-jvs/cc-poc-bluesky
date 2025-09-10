import type { CSSProperties } from "react";
import type { NotificationState } from "../../../hooks/useNotification";

export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export const getPositionStyles = (
  position: NotificationPosition
): CSSProperties => {
  const baseStyles: CSSProperties = {
    position: "fixed",
    zIndex: 1000,
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    animation: "slideInRight 0.3s ease-out",
  };

  switch (position) {
    case "top-right":
      return { ...baseStyles, top: "20px", right: "20px" };
    case "top-left":
      return { ...baseStyles, top: "20px", left: "20px" };
    case "bottom-right":
      return { ...baseStyles, bottom: "20px", right: "20px" };
    case "bottom-left":
      return { ...baseStyles, bottom: "20px", left: "20px" };
    default:
      return { ...baseStyles, top: "20px", right: "20px" };
  }
};

export const getTypeStyles = (
  type: NotificationState["type"]
): CSSProperties => {
  switch (type) {
    case "success":
      return {
        backgroundColor: "#d4edda",
        color: "#155724",
        borderColor: "#c3e6cb",
      };
    case "error":
      return {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        borderColor: "#f5c6cb",
      };
    case "warning":
      return {
        backgroundColor: "#fff3cd",
        color: "#856404",
        borderColor: "#ffeaa7",
      };
    case "info":
      return {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
        borderColor: "#bee5eb",
      };
    default:
      return {
        backgroundColor: "#f8f9fa",
        color: "#495057",
        borderColor: "#dee2e6",
      };
  }
};

export const getProgressBarColor = (
  type: NotificationState["type"]
): string => {
  switch (type) {
    case "success":
      return "#28a745";
    case "error":
      return "#dc3545";
    case "warning":
      return "#ffc107";
    case "info":
      return "#17a2b8";
    default:
      return "#6c757d";
  }
};

export const notificationContainerStyles: CSSProperties = {
  border: "1px solid",
  borderRadius: "8px",
  padding: "16px",
};

export const iconStyles: CSSProperties = {
  flexShrink: 0,
  fontSize: "20px",
};

export const contentStyles: CSSProperties = {
  flex: 1,
};

export const titleStyles: CSSProperties = {
  fontWeight: "bold",
  marginBottom: "4px",
};

export const messageStyles: CSSProperties = {
  fontSize: "14px",
};

export const detailsStyles: CSSProperties = {
  fontSize: "12px",
  marginTop: "4px",
  opacity: 0.8,
};

export const closeButtonStyles: CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  padding: "0",
  lineHeight: 1,
  opacity: 0.7,
};

export const getProgressBarStyles = (
  type: NotificationState["type"],
  duration: number
): CSSProperties => ({
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  height: "3px",
  backgroundColor: getProgressBarColor(type),
  borderRadius: "0 0 8px 8px",
  animation: `progressBar ${duration}ms linear forwards`,
});
