import type { MenuItem, StopItemPayload } from "@/types/menu";

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // The response body is optional; use the operation-specific fallback below.
  }

  return fallbackMessage;
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const response = await fetch("/api/menu-items");

  if (!response.ok) {
    throw new Error("Не удалось загрузить позиции меню");
  }

  return response.json();
}

export async function stopMenuItem(
  id: string,
  payload: StopItemPayload,
): Promise<MenuItem> {
  const response = await fetch(`/api/menu-items/${encodeURIComponent(id)}/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Не удалось сохранить позицию в стоп-листе"),
    );
  }

  return response.json();
}

export async function resumeMenuItem(id: string): Promise<MenuItem> {
  const response = await fetch(
    `/api/menu-items/${encodeURIComponent(id)}/resume`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Не удалось вернуть позицию в продажу"),
    );
  }

  return response.json();
}
