"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

import {
  parseMenuFilters,
  type MenuFilters,
  type ShopFilter,
  type StatusFilter,
  updateMenuFilterSearchParams,
} from "@/features/stop-list/model/filters";

type FiltersProps = {
  filters: MenuFilters;
};

const selectClassName =
  "mt-1.5 block min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200";

export function Filters({ filters }: FiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(
    update:
      | { name: "shop"; value: ShopFilter }
      | { name: "status"; value: StatusFilter },
  ) {
    const query = updateMenuFilterSearchParams(
      searchParams.toString(),
      filters,
      update,
    );
    router.push(query === "" ? pathname : `${pathname}?${query}`);
  }

  function handleShopChange(event: ChangeEvent<HTMLSelectElement>) {
    const shop = parseMenuFilters({ shop: event.target.value }).shop;
    updateFilter({ name: "shop", value: shop });
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const status = parseMenuFilters({ status: event.target.value }).status;
    updateFilter({ name: "status", value: status });
  }

  return (
    <section
      aria-label="Фильтры меню"
      className="mb-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label className="text-sm font-medium text-slate-700">
        Цех
        <select
          className={selectClassName}
          name="shop"
          value={filters.shop ?? ""}
          onChange={handleShopChange}
        >
          <option value="">Все</option>
          <option value="kitchen">Кухня</option>
          <option value="bar">Бар</option>
          <option value="pastry">Кондитерская</option>
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700">
        Статус
        <select
          className={selectClassName}
          name="status"
          value={filters.status ?? ""}
          onChange={handleStatusChange}
        >
          <option value="">Все</option>
          <option value="available">Доступно</option>
          <option value="stopped">В стоп-листе</option>
        </select>
      </label>
    </section>
  );
}
