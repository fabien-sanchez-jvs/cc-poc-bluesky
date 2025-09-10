import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Chargement...",
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const getClasses = () => {
    return clsx(
      "btn",
      `btn-${variant}`,
      {
        [`btn-${size}`]: size !== "md",
        loading: loading,
      },
      className
    );
  };
  return (
    <button disabled={loading || disabled} className={getClasses()} {...props}>
      {loading ? loadingText : children}
    </button>
  );
}
