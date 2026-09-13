import type { MenuItem } from "@/types/menu";

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const response = await fetch("/api/menu-items");

  if (!response.ok) {
    throw new Error("Не удалось загрузить позиции меню");
  }

  return response.json();
}
