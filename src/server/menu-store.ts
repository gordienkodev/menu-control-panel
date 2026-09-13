import "server-only";

import type { MenuItem, StopItemPayload } from "@/types/menu";

type MenuItemMutationResult =
  | { ok: true; item: MenuItem }
  | { ok: false; error: "not_found" | "out_of_stock" };

const menuItems: MenuItem[] = [
  {
    id: "kitchen-caesar-chicken",
    title: "Цезарь с курицей",
    shop: "kitchen",
    stock: 18,
    status: { kind: "available" },
    updatedAt: "2026-09-13T08:15:00.000Z",
  },
  {
    id: "kitchen-beef-stroganoff",
    title: "Бефстроганов с картофельным пюре",
    shop: "kitchen",
    stock: 9,
    status: { kind: "available" },
    updatedAt: "2026-09-13T08:20:00.000Z",
  },
  {
    id: "kitchen-salmon-steak",
    title: "Стейк из лосося",
    shop: "kitchen",
    stock: 0,
    status: {
      kind: "stopped",
      reason: "out_of_stock",
      until: null,
    },
    updatedAt: "2026-09-13T09:05:00.000Z",
  },
  {
    id: "kitchen-mushroom-risotto",
    title: "Ризотто с белыми грибами",
    shop: "kitchen",
    stock: 7,
    status: {
      kind: "stopped",
      reason: "quality",
      until: "2026-09-13T13:30:00.000Z",
    },
    updatedAt: "2026-09-13T09:30:00.000Z",
  },
  {
    id: "kitchen-tom-yum",
    title: "Том-ям с креветками",
    shop: "kitchen",
    stock: 12,
    status: { kind: "available" },
    updatedAt: "2026-09-13T08:40:00.000Z",
  },
  {
    id: "bar-cappuccino",
    title: "Капучино",
    shop: "bar",
    stock: 42,
    status: { kind: "available" },
    updatedAt: "2026-09-13T07:45:00.000Z",
  },
  {
    id: "bar-berry-lemonade",
    title: "Ягодный лимонад",
    shop: "bar",
    stock: 16,
    status: {
      kind: "stopped",
      reason: "equipment",
      until: "2026-09-13T14:00:00.000Z",
    },
    updatedAt: "2026-09-13T10:00:00.000Z",
  },
  {
    id: "bar-matcha-latte",
    title: "Матча-латте",
    shop: "bar",
    stock: 11,
    status: { kind: "available" },
    updatedAt: "2026-09-13T08:05:00.000Z",
  },
  {
    id: "bar-orange-fresh",
    title: "Апельсиновый фреш",
    shop: "bar",
    stock: 5,
    status: { kind: "available" },
    updatedAt: "2026-09-13T09:10:00.000Z",
  },
  {
    id: "bar-tonic-espresso",
    title: "Эспрессо-тоник",
    shop: "bar",
    stock: 8,
    status: {
      kind: "stopped",
      reason: "menu_change",
      until: null,
    },
    updatedAt: "2026-09-13T08:55:00.000Z",
  },
  {
    id: "pastry-almond-croissant",
    title: "Миндальный круассан",
    shop: "pastry",
    stock: 6,
    status: { kind: "available" },
    updatedAt: "2026-09-13T07:30:00.000Z",
  },
  {
    id: "pastry-pistachio-eclair",
    title: "Фисташковый эклер",
    shop: "pastry",
    stock: 3,
    status: { kind: "available" },
    updatedAt: "2026-09-13T07:35:00.000Z",
  },
  {
    id: "pastry-basque-cheesecake",
    title: "Баскский чизкейк",
    shop: "pastry",
    stock: 4,
    status: {
      kind: "stopped",
      reason: "quality",
      until: "2026-09-13T12:45:00.000Z",
    },
    updatedAt: "2026-09-13T09:45:00.000Z",
  },
  {
    id: "pastry-blueberry-tart",
    title: "Тарт с голубикой",
    shop: "pastry",
    stock: 10,
    status: { kind: "available" },
    updatedAt: "2026-09-13T08:00:00.000Z",
  },
];

export function getMenuItems(): MenuItem[] {
  return menuItems;
}

export function stopMenuItem(
  id: string,
  payload: StopItemPayload,
): MenuItemMutationResult {
  const itemIndex = menuItems.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return { ok: false, error: "not_found" };
  }

  const updatedItem: MenuItem = {
    ...menuItems[itemIndex],
    status: {
      kind: "stopped",
      reason: payload.reason,
      until: payload.until,
    },
    updatedAt: new Date().toISOString(),
  };

  menuItems[itemIndex] = updatedItem;

  return { ok: true, item: updatedItem };
}

export function resumeMenuItem(id: string): MenuItemMutationResult {
  const itemIndex = menuItems.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return { ok: false, error: "not_found" };
  }

  const item = menuItems[itemIndex];

  if (item.stock === 0) {
    return { ok: false, error: "out_of_stock" };
  }

  const updatedItem: MenuItem = {
    ...item,
    status: { kind: "available" },
    updatedAt: new Date().toISOString(),
  };

  menuItems[itemIndex] = updatedItem;

  return { ok: true, item: updatedItem };
}
