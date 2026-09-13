import { getMenuItems } from "@/server/menu-store";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function GET(): Promise<Response> {
  await delay(600);

  const items = getMenuItems();

  return Response.json(items);
}
