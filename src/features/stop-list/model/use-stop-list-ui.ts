"use client";

import { create } from "zustand";

type StopListUiState = {
  selectedItemId: string | null;
  openPanel: (itemId: string) => void;
  closePanel: () => void;
};

export const useStopListUi = create<StopListUiState>((set) => ({
  selectedItemId: null,
  openPanel: (itemId) => set({ selectedItemId: itemId }),
  closePanel: () => set({ selectedItemId: null }),
}));
