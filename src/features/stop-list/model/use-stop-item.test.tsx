import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { stopMenuItem } from "@/features/stop-list/api/menu-api";
import { menuQueryKeys } from "@/features/stop-list/model/queries";
import { useStopItem } from "@/features/stop-list/model/use-stop-item";
import type { MenuItem, StopItemPayload } from "@/types/menu";

vi.mock("@/features/stop-list/api/menu-api", () => ({
  stopMenuItem: vi.fn(),
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe("useStopItem", () => {
  it("optimistic stop update rolls back when mutation fails", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const originalItem: MenuItem = {
      id: "test-item",
      title: "Test item",
      shop: "kitchen",
      stock: 5,
      status: { kind: "available" },
      updatedAt: "2026-09-13T12:00:00.000Z",
    };
    const payload: StopItemPayload = {
      reason: "equipment",
      until: null,
    };
    const request = createDeferred<MenuItem>();

    vi.mocked(stopMenuItem).mockReturnValue(request.promise);
    queryClient.setQueryData<MenuItem[]>(menuQueryKeys.list(), [originalItem]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useStopItem(), { wrapper });

    expect(queryClient.getQueryData<MenuItem[]>(menuQueryKeys.list())).toEqual([
      originalItem,
    ]);

    act(() => {
      result.current.mutate({ id: originalItem.id, payload });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);

      const optimisticItem = queryClient
        .getQueryData<MenuItem[]>(menuQueryKeys.list())
        ?.find((item) => item.id === originalItem.id);

      expect(optimisticItem?.status).toEqual({
        kind: "stopped",
        reason: payload.reason,
        until: payload.until,
      });
    });

    expect(stopMenuItem).toHaveBeenCalledWith(originalItem.id, payload);

    act(() => {
      request.reject(new Error("Simulated server error"));
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(
        queryClient.getQueryData<MenuItem[]>(menuQueryKeys.list()),
      ).toEqual([originalItem]);
    });
  });
});
