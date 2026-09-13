"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  datetimeLocalToIso,
  getNextQuarterHourIso,
  isoToDatetimeLocal,
  stopItemSchema,
  type StopItemFormValues,
} from "@/features/stop-list/model/stop-item-schema";
import { useStopListUi } from "@/features/stop-list/model/use-stop-list-ui";
import type { MenuItem, StopItemPayload } from "@/types/menu";

type StopReasonPanelProps = {
  item: MenuItem;
  isPending: boolean;
  onSubmit: (payload: StopItemPayload) => void;
};

function getDefaultValues(item: MenuItem): Partial<StopItemFormValues> {
  if (item.status.kind === "stopped") {
    return {
      reason: item.status.reason,
      until: item.status.until,
    };
  }

  return {
    reason: undefined,
    until: null,
  };
}

const fieldClassName =
  "mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2";

export function StopReasonPanel({
  item,
  isPending,
  onSubmit,
}: StopReasonPanelProps) {
  const closePanel = useStopListUi((state) => state.closePanel);
  const isEditMode = item.status.kind === "stopped";
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StopItemFormValues>({
    resolver: zodResolver(stopItemSchema),
    mode: "onBlur",
    defaultValues: getDefaultValues(item),
  });
  const until = useWatch({ control, name: "until" });
  const usesExactTime = until !== null;

  useEffect(() => {
    reset(getDefaultValues(item));
  }, [item, reset]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closePanel]);

  function submitPayload(payload: StopItemFormValues) {
    if (isPending) {
      return;
    }

    onSubmit(payload);
    closePanel();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35">
      <section
        aria-labelledby="stop-reason-panel-title"
        aria-modal="true"
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {isEditMode ? "Редактирование стоп-листа" : "Добавление в стоп-лист"}
            </p>
            <h2
              className="mt-1 text-xl font-bold text-slate-950"
              id="stop-reason-panel-title"
            >
              {item.title}
            </h2>
          </div>
          <button
            aria-label="Закрыть панель"
            autoFocus
            className="rounded-lg p-2 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            type="button"
            onClick={closePanel}
          >
            ×
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submitPayload)}>
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="stop-reason"
            >
              Причина
            </label>
            <select
              {...register("reason")}
              aria-describedby={errors.reason ? "stop-reason-error" : undefined}
              aria-invalid={errors.reason ? "true" : "false"}
              className={`${fieldClassName} ${
                errors.reason
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
              }`}
              id="stop-reason"
            >
              <option value="">Выберите причину</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="equipment">Проблема с оборудованием</option>
              <option value="quality">Проблема с качеством</option>
              <option value="menu_change">Изменение меню</option>
            </select>
            {errors.reason && (
              <p className="mt-1.5 text-sm text-red-600" id="stop-reason-error">
                {errors.reason.message}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">
              Срок остановки
            </legend>
            <div className="mt-2 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
                <input
                  checked={!usesExactTime}
                  className="size-4 accent-slate-900"
                  name="stop-until-mode"
                  type="radio"
                  onChange={() =>
                    setValue("until", null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                До конца смены
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
                <input
                  checked={usesExactTime}
                  className="size-4 accent-slate-900"
                  name="stop-until-mode"
                  type="radio"
                  onChange={() =>
                    setValue("until", getNextQuarterHourIso(), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                До конкретного времени
              </label>
            </div>
          </fieldset>

          {usesExactTime && (
            <Controller
              control={control}
              name="until"
              render={({ field }) => (
                <div>
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="stop-until"
                  >
                    Дата и время
                  </label>
                  <input
                    aria-describedby={errors.until ? "stop-until-error" : undefined}
                    aria-invalid={errors.until ? "true" : "false"}
                    className={`${fieldClassName} ${
                      errors.until
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
                    }`}
                    id="stop-until"
                    name={field.name}
                    ref={field.ref}
                    step={900}
                    type="datetime-local"
                    value={
                      typeof field.value === "string"
                        ? isoToDatetimeLocal(field.value)
                        : ""
                    }
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(datetimeLocalToIso(event.target.value))
                    }
                  />
                  {errors.until && (
                    <p className="mt-1.5 text-sm text-red-600" id="stop-until-error">
                      {errors.until.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              type="button"
              onClick={closePanel}
            >
              Отмена
            </button>
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? "Сохраняется…"
                : isEditMode
                  ? "Сохранить"
                  : "Добавить"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
