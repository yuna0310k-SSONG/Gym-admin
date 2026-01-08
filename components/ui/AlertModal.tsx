"use client";

import Button from "./Button";

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  onClose: () => void;
  confirmText?: string;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  type = "info",
  onClose,
  confirmText = "확인",
}: AlertModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    info: {
      icon: "ℹ️",
      titleColor: "text-blue-400",
      borderColor: "border-blue-500/30",
    },
    success: {
      icon: "✅",
      titleColor: "text-green-400",
      borderColor: "border-green-500/30",
    },
    error: {
      icon: "❌",
      titleColor: "text-red-400",
      borderColor: "border-red-500/30",
    },
    warning: {
      icon: "⚠️",
      titleColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div
        className={`bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border ${style.borderColor}`}
      >
        <div className="flex items-start space-x-3 mb-4">
          <span className="text-2xl">{style.icon}</span>
          <div className="flex-1">
            {title && (
              <h3 className={`text-lg font-semibold ${style.titleColor} mb-2`}>
                {title}
              </h3>
            )}
            <p className="text-[#c9c7c7] text-sm whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}


