"use client";

import {
  useMutation,
  useMutationState,
  useQueryClient,
  type Mutation,
} from "@tanstack/react-query";

import { resumeMenuItem } from "@/features/stop-list/api/menu-api";
import {
  menuMutationKeys,
  menuQueryKeys,
} from "@/features/stop-list/model/queries";
import type { MenuItem } from "@/types/menu";

export type ResumeMenuItemVariables = {
  id: string;
};

type ResumeMenuItemContext = {
  previousItems: MenuItem[] | undefined;
};

type ResumeMutation = Mutation<
  MenuItem,
  Error,
  ResumeMenuItemVariables,
  ResumeMenuItemContext
>;

export function useResumeItem() {
  const queryClient = useQueryClient();
  const pendingItemIds = useMutationState<string, ResumeMutation>({
    filters: {
      mutationKey: menuMutationKeys.resume(),
      status: "pending",
    },
    select: (mutation) => mutation.state.variables?.id ?? "",
  });
  const mutation = useMutation<
    MenuItem,
    Error,
    ResumeMenuItemVariables,
    ResumeMenuItemContext
  >({
    mutationKey: menuMutationKeys.resume(),
    mutationFn: ({ id }) => resumeMenuItem(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: menuQueryKeys.list() });

      const previousItems = queryClient.getQueryData<MenuItem[]>(
        menuQueryKeys.list(),
      );

      queryClient.setQueryData<MenuItem[]>(menuQueryKeys.list(), (items) =>
        items?.map((item) =>
          item.id === id
            ? {
                ...item,
                status: { kind: "available" },
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
