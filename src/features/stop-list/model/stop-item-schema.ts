import { z } from "zod";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const stopItemSchema = z
  .object({
    reason: z.enum(
      ["out_of_stock", "equipment", "quality", "menu_change"],
      { error: "Выберите причину" },
    ),
    until: z.union([
      z.iso.datetime({
        offset: true,
        error: "Укажите корректные дату и время",
      }),
      z.null(),
    ]),
  })
  .superRefine((payload, context) => {
    if (payload.until === null) {
      return;
    }

    const untilTimestamp = Date.parse(payload.until);

    if (Number.isNaN(untilTimestamp)) {
      return;
    }

    const now = Date.now();

    if (untilTimestamp <= now) {
      context.addIssue({
        code: "custom",
        path: ["until"],
        message: "Время должно быть в будущем",
      });
    } else if (untilTimestamp > now + TWENTY_FOUR_HOURS_MS) {
      context.addIssue({
        code: "custom",
        path: ["until"],
        message: "Время не может быть больше чем через 24 часа",
      });
    }

    if (untilTimestamp % FIFTEEN_MINUTES_MS !== 0) {
      context.addIssue({
        code: "custom",
        path: ["until"],
        message: "Выберите время с шагом 15 минут",
      });
    }
  });

export type StopItemFormValues = z.infer<typeof stopItemSchema>;

export function datetimeLocalToIso(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export function isoToDatetimeLocal(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getNextQuarterHourIso(): string {
  const nextQuarter =
    Math.floor(Date.now() / FIFTEEN_MINUTES_MS) * FIFTEEN_MINUTES_MS +
    FIFTEEN_MINUTES_MS;

  return new Date(nextQuarter).toISOString();
}
