import { stopItemSchema } from "@/features/stop-list/model/stop-item-schema";
import { stopMenuItem } from "@/server/menu-store";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  await delay(600);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const validationResult = stopItemSchema.safeParse(body);

  if (!validationResult.success) {
    return Response.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (Math.random() < 0.2) {
    return Response.json(
      { message: "Simulated server error" },
      { status: 500 },
    );
  }

  const { id } = await params;
  const result = stopMenuItem(id, validationResult.data);

  if (!result.ok) {
    return Response.json({ message: "Menu item not found" }, { status: 404 });
  }

  return Response.json(result.item);
}
