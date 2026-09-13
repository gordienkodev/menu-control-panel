"use client";

import {
  useMutation,
  useMutationState,
  useQueryClient,
  type Mutation,
} from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import { stopMenuItem } from "@/features/stop-list/api/menu-api";
import {
  menuMutationKeys,
  menuQueryKeys,
} from "@/features/stop-list/model/queries";
import { useStopListUi } from "@/features/stop-list/model/use-stop-list-ui";
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
  const activeItemIds = useRef(new Set<string>());
  const showErrorToast = useStopListUi((state) => state.showErrorToast);
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
    onError: (error, { id }, context) => {
      const previousItem = context?.previousItems?.find((item) => item.id === id);

      if (previousItem) {
        queryClient.setQueryData<MenuItem[]>(menuQueryKeys.list(), (items) =>
          items?.map((item) => (item.id === id ? previousItem : item)),
        );
      }

      showErrorToast(error.message);
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

  const mutateOnce = useCallback(
    (variables: StopMenuItemVariables) => {
      if (activeItemIds.current.has(variables.id)) {
        return;
      }

      activeItemIds.current.add(variables.id);
      mutation.mutate(variables, {
        onSettled: () => activeItemIds.current.delete(variables.id),
      });
    },
    [mutation],
  );

  return {
    ...mutation,
    mutateOnce,
    pendingItemIds: new Set(pendingItemIds),
  };
}
