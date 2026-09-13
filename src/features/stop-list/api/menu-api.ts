import type { MenuItem, StopItemPayload } from "@/types/menu";

const apiErrorMessages: Record<string, string> = {
  "Invalid JSON body": "Сервер не смог прочитать данные запроса",
  "Invalid request body": "Сервер отклонил данные формы",
  "Menu item not found": "Позиция меню не найдена",
  "Menu item with zero stock cannot be resumed":
    "Нельзя вернуть в продажу: остаток равен 0",
  "Simulated server error": "Временная ошибка сервера. Изменения отменены",
};

async function request(
  input: string,
  fallbackMessage: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(fallbackMessage);
  }
}

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
      return apiErrorMessages[body.message] ?? body.message;
    }
  } catch {
    // The response body is optional; use the operation-specific fallback below.
  }

  return fallbackMessage;
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const response = await request(
    "/api/menu-items",
    "Не удалось загрузить позиции меню",
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить позиции меню");
  }

  return response.json();
}

export async function stopMenuItem(
  id: string,
  payload: StopItemPayload,
): Promise<MenuItem> {
  const fallbackMessage = "Не удалось сохранить изменения";
  const response = await request(
    `/api/menu-items/${encodeURIComponent(id)}/stop`,
    fallbackMessage,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallbackMessage));
  }

  return response.json();
}

export async function resumeMenuItem(id: string): Promise<MenuItem> {
  const fallbackMessage = "Не удалось вернуть позицию в продажу";
  const response = await request(
    `/api/menu-items/${encodeURIComponent(id)}/resume`,
    fallbackMessage,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallbackMessage));
  }

  return response.json();
}
