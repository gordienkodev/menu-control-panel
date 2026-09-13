import { queryOptions } from "@tanstack/react-query";

import { fetchMenuItems } from "@/features/stop-list/api/menu-api";

export const menuQueryKeys = {
  list: () => ["menu-items"] as const,
};

export const menuItemsQueryOptions = () =>
  queryOptions({
    queryKey: menuQueryKeys.list(),
    queryFn: fetchMenuItems,
  });
