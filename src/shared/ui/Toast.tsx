"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, onDismiss]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      aria-atomic="true"
      className={`fixed inset-x-3 top-3 z-[60] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:right-6 sm:top-6 ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-slate-200 bg-white text-slate-900"
      }`}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
      role={tone === "error" ? "alert" : "status"}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
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
    </motion.div>
  );
}
