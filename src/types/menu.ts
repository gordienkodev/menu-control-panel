export type Shop = "kitchen" | "bar" | "pastry";

export type StopReason =
  | "out_of_stock"
  | "equipment"
  | "quality"
  | "menu_change";

export type MenuItemStatus =
  | { kind: "available" }
  | {
      kind: "stopped";
      reason: StopReason;
      until: string | null;
    };

export type MenuItem = {
  id: string;
  title: string;
  shop: Shop;
  stock: number;
  status: MenuItemStatus;
  updatedAt: string;
};

export type StopItemPayload = {
  reason: StopReason;
  until: string | null;
};
