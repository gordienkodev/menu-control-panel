"use client";

import { useCallback } from "react";

import { useStopListUi } from "@/features/stop-list/model/use-stop-list-ui";
import { Toast } from "@/shared/ui/Toast";

export function StopListToast() {
  const toast = useStopListUi((state) => state.toast);
  const dismissToast = useStopListUi((state) => state.dismissToast);
  const handleDismiss = useCallback(() => {
    if (toast) {
      dismissToast(toast.id);
    }
  }, [dismissToast, toast]);

  if (!toast) {
    return null;
  }

  return (
    <Toast
      key={toast.id}
      message={toast.message}
      tone={toast.tone}
      onDismiss={handleDismiss}
    />
  );
}
