import { queryOptions } from "@tanstack/react-query";

import { fetchMenuItems } from "@/features/stop-list/api/menu-api";

export const menuQueryKeys = {
  list: () => ["menu-items"] as const,
};

export const menuMutationKeys = {
  all: () => [...menuQueryKeys.list(), "mutation"] as const,
  stop: () => [...menuMutationKeys.all(), "stop"] as const,
  resume: () => [...menuMutationKeys.all(), "resume"] as const,
};

export const menuItemsQueryOptions = () =>
  queryOptions({
    queryKey: menuQueryKeys.list(),
    queryFn: fetchMenuItems,
  });
