"use client";

import {
  useMutation,
  useMutationState,
  useQueryClient,
  type Mutation,
} from "@tanstack/react-query";

import { stopMenuItem } from "@/features/stop-list/api/menu-api";
import {
  menuMutationKeys,
  menuQueryKeys,
} from "@/features/stop-list/model/queries";
import type { MenuItem, StopItemPayload } from "@/types/menu";

export type StopMenuItemVariables = {
  id: string;
  payload: StopItemPayload;
};

type StopMenuItemContext = {
  previousItems: MenuItem[] | undefined;
};

type StopMutation = Mutation<
  MenuItem,
  Error,
  StopMenuItemVariables,
  StopMenuItemContext
>;

export function useStopItem() {
  const queryClient = useQueryClient();
  const pendingItemIds = useMutationState<string, StopMutation>({
    filters: {
      mutationKey: menuMutationKeys.stop(),
      status: "pending",
    },
    select: (mutation) => mutation.state.variables?.id ?? "",
  });
  const mutation = useMutation<
    MenuItem,
    Error,
    StopMenuItemVariables,
    StopMenuItemContext
  >({
    mutationKey: menuMutationKeys.stop(),
    mutationFn: ({ id, payload }) => stopMenuItem(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: menuQueryKeys.list() });

      const previousItems = queryClient.getQueryData<MenuItem[]>(
        menuQueryKeys.list(),
      );

      queryClient.setQueryData<MenuItem[]>(menuQueryKeys.list(), (items) =>
        items?.map((item) =>
          item.id === id
            ? {
                ...item,
                status: {
                  kind: "stopped",
                  reason: payload.reason,
                  until: payload.until,
                },
              }
            : item,
        ),
      );

      return { previousItems };
    },
    onError: (_error, { id }, context) => {
      const previousItem = context?.previousItems?.find((item) => item.id === id);

      if (!previousItem) {
        return;
      }

      queryClient.setQueryData<MenuItem[]>(menuQueryKeys.list(), (items) =>
        items?.map((item) => (item.id === id ? previousItem : item)),
      );
    },
    onSuccess: (serverItem) => {
      queryClient.setQueryData<MenuItem[]>(menuQueryKeys.list(), (items) =>
        items?.map((item) => (item.id === serverItem.id ? serverItem : item)),
      );
    },
    onSettled: async () => {
      if (
        queryClient.isMutating({ mutationKey: menuMutationKeys.all() }) === 1
      ) {
        await queryClient.invalidateQueries({ queryKey: menuQueryKeys.list() });
      }
    },
  });

  return {
    ...mutation,
    pendingItemIds: new Set(pendingItemIds),
  };
}
