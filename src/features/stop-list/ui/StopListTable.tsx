"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  filterMenuItems,
  type MenuFilters,
} from "@/features/stop-list/model/filters";
import { menuItemsQueryOptions } from "@/features/stop-list/model/queries";
import { useResumeItem } from "@/features/stop-list/model/use-resume-item";
import { useStopItem } from "@/features/stop-list/model/use-stop-item";
import { useStopListUi } from "@/features/stop-list/model/use-stop-list-ui";
import { StopReasonPanel } from "@/features/stop-list/ui/StopReasonPanel";
import type {
  MenuItem,
  MenuItemStatus,
  Shop,
  StopItemPayload,
  StopReason,
} from "@/types/menu";

const shopLabels: Record<Shop, string> = {
  kitchen: "Кухня",
  bar: "Бар",
  pastry: "Кондитерский цех",
};

const stopReasonLabels: Record<StopReason, string> = {
  out_of_stock: "Нет в наличии",
  equipment: "Проблема с оборудованием",
  quality: "Проблема с качеством",
  menu_change: "Изменение меню",
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatStopUntil(until: string | null): string {
  return until === null
    ? "До конца смены"
    : dateFormatter.format(new Date(until));
}

function StopDetails({ status }: { status: MenuItemStatus }) {
  if (status.kind === "available") {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="space-y-1">
      <p className="font-medium text-slate-800">
        {stopReasonLabels[status.reason]}
      </p>
      <p className="text-sm">{formatStopUntil(status.until)}</p>
    </div>
  );
}

type MenuRowProps = {
  item: MenuItem;
  isPending: boolean;
  onOpenPanel: (itemId: string) => void;
  onResume: (itemId: string) => void;
};

function MenuRow({ item, isPending, onOpenPanel, onResume }: MenuRowProps) {
  const isStopped = item.status.kind === "stopped";
  const cannotResume = isStopped && item.stock === 0;

  return (
    <tr className={isStopped ? "bg-red-50/70" : "bg-white"}>
      <th
        scope="row"
        className="px-6 py-4 text-left font-medium text-slate-950"
      >
        {item.title}
      </th>
      <td className="px-6 py-4 text-slate-600">{shopLabels[item.shop]}</td>
      <td className="px-6 py-4 text-slate-600">{item.stock}</td>
      <td className="px-6 py-4">
        <span
          className={
            isStopped
              ? "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
              : "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
          }
        >
          {isStopped ? "Остановлена" : "Доступна"}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-600">
        <StopDetails status={item.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end gap-2">
          <div className="flex justify-end gap-2">
            <button
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="button"
              onClick={() => onOpenPanel(item.id)}
            >
              {isPending
                ? "Сохраняется…"
                : isStopped
                  ? "Редактировать"
                  : "В стоп-лист"}
            </button>
            {isStopped && (
              <button
                className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={cannotResume || isPending}
                type="button"
                onClick={() => onResume(item.id)}
              >
                Вернуть в продажу
              </button>
            )}
          </div>
          {cannotResume && (
            <p className="max-w-64 text-xs text-slate-500">
              Нельзя вернуть в продажу: остаток равен 0
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

function LoadingState() {
  return (
    <div
      className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white"
      role="status"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
        Загружаем позиции меню…
      </div>
    </div>
  );
}

type StopListTableProps = {
  filters: MenuFilters;
};

export function StopListTable({ filters }: StopListTableProps) {
  const menuQuery = useQuery(menuItemsQueryOptions());
  const stopItemMutation = useStopItem();
  const resumeItemMutation = useResumeItem();
  const selectedItemId = useStopListUi((state) => state.selectedItemId);
  const openPanel = useStopListUi((state) => state.openPanel);
  const closePanel = useStopListUi((state) => state.closePanel);
  const selectedItem = menuQuery.data?.find(
    (item) => item.id === selectedItemId,
  );

  useEffect(() => {
    if (menuQuery.isSuccess && selectedItemId !== null && !selectedItem) {
      closePanel();
    }
  }, [closePanel, menuQuery.isSuccess, selectedItem, selectedItemId]);

  if (menuQuery.isPending) {
    return <LoadingState />;
  }

  if (menuQuery.isError) {
    return (
      <div
        className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 px-6 text-center"
        role="alert"
      >
        <div>
          <h2 className="font-semibold text-red-900">Не удалось загрузить меню</h2>
          <p className="mt-1 text-sm text-red-700">
            Проверьте соединение и попробуйте ещё раз.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={menuQuery.isFetching}
          onClick={() => void menuQuery.refetch()}
        >
          {menuQuery.isFetching ? "Повторяем запрос…" : "Попробовать снова"}
        </button>
      </div>
    );
  }

  if (menuQuery.data.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <div>
          <h2 className="font-semibold text-slate-900">Позиции меню не найдены</h2>
          <p className="mt-1 text-sm text-slate-500">
            В меню пока нет ни одной позиции.
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = filterMenuItems(menuQuery.data, filters);

  if (filteredItems.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <div>
          <h2 className="font-semibold text-slate-900">
            По выбранным фильтрам позиции не найдены
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Измените или сбросьте фильтры.
          </p>
        </div>
      </div>
    );
  }

  function handlePreparedPayload(payload: StopItemPayload): void {
    if (selectedItemId === null) {
      return;
    }

    stopItemMutation.mutate({ id: selectedItemId, payload });
  }

  const pendingItemIds = new Set([
    ...stopItemMutation.pendingItemIds,
    ...resumeItemMutation.pendingItemIds,
  ]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[72rem] border-collapse text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-semibold">
                Название
              </th>
              <th scope="col" className="px-6 py-3 text-left font-semibold">
                Цех
              </th>
              <th scope="col" className="px-6 py-3 text-left font-semibold">
                Остаток
              </th>
              <th scope="col" className="px-6 py-3 text-left font-semibold">
                Статус
              </th>
              <th scope="col" className="px-6 py-3 text-left font-semibold">
                Стоп-лист
              </th>
              <th scope="col" className="px-6 py-3 text-right font-semibold">
                Действие
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredItems.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                isPending={pendingItemIds.has(item.id)}
                onOpenPanel={openPanel}
                onResume={(id) => resumeItemMutation.mutate({ id })}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selectedItem && (
        <StopReasonPanel
          item={selectedItem}
          onSubmit={handlePreparedPayload}
        />
      )}
    </>
  );
}
