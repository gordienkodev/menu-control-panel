"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  tone: "error";
  onDismiss: () => void;
  duration?: number;
};

export function Toast({
  message,
  tone,
  onDismiss,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, onDismiss]);

  return (
    <div
      aria-atomic="true"
      className={`fixed right-6 top-6 z-[60] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-slate-200 bg-white text-slate-900"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      <p className="font-medium">{message}</p>
      <button
        aria-label="Закрыть уведомление"
        className="-mr-1 rounded p-1 leading-none text-current opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        type="button"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
