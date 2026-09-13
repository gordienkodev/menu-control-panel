"use client";

import { create } from "zustand";

type StopListUiState = {
  selectedItemId: string | null;
  toast: {
    id: number;
    message: string;
    tone: "error";
  } | null;
  openPanel: (itemId: string) => void;
  closePanel: () => void;
  showErrorToast: (message: string) => void;
  dismissToast: (id: number) => void;
};

let nextToastId = 0;

export const useStopListUi = create<StopListUiState>((set) => ({
  selectedItemId: null,
  toast: null,
  openPanel: (itemId) => set({ selectedItemId: itemId }),
  closePanel: () => set({ selectedItemId: null }),
  showErrorToast: (message) =>
    set({
      toast: {
        id: ++nextToastId,
        message,
        tone: "error",
      },
    }),
  dismissToast: (id) =>
    set((state) => (state.toast?.id === id ? { toast: null } : state)),
}));
