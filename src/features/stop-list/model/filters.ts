import type { MenuItem, Shop } from "@/types/menu";

export type ShopFilter = Shop | null;
export type StatusFilter = MenuItem["status"]["kind"] | null;

export type MenuFilters = {
  shop: ShopFilter;
  status: StatusFilter;
};

export type MenuFilterSearchParams = {
  shop?: string | string[];
  status?: string | string[];
};

export type MenuFilterUpdate =
  | { name: "shop"; value: ShopFilter }
  | { name: "status"; value: StatusFilter };

function isShop(value: string | undefined): value is Shop {
  return value === "kitchen" || value === "bar" || value === "pastry";
}

function isStatus(
  value: string | undefined,
): value is Exclude<StatusFilter, null> {
  return value === "available" || value === "stopped";
}

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export function parseMenuFilters(
  searchParams: MenuFilterSearchParams,
): MenuFilters {
  const shop = getSingleValue(searchParams.shop);
  const status = getSingleValue(searchParams.status);

  return {
    shop: isShop(shop) ? shop : null,
    status: isStatus(status) ? status : null,
  };
}

export function filterMenuItems(
  items: MenuItem[],
  filters: MenuFilters,
): MenuItem[] {
  return items.filter(
    (item) =>
      (filters.shop === null || item.shop === filters.shop) &&
      (filters.status === null || item.status.kind === filters.status),
  );
}

function setFilterParam(
  searchParams: URLSearchParams,
  name: keyof MenuFilters,
  value: ShopFilter | StatusFilter,
) {
  if (value === null) {
    searchParams.delete(name);
  } else {
    searchParams.set(name, value);
  }
}

export function updateMenuFilterSearchParams(
  currentSearchParams: string,
  filters: MenuFilters,
  update: MenuFilterUpdate,
): string {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  setFilterParam(nextSearchParams, "shop", filters.shop);
  setFilterParam(nextSearchParams, "status", filters.status);
  setFilterParam(nextSearchParams, update.name, update.value);

  return nextSearchParams.toString();
}
