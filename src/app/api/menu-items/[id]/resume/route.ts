import { resumeMenuItem } from "@/server/menu-store";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  await delay(600);

  if (Math.random() < 0.2) {
    return Response.json(
      { message: "Simulated server error" },
      { status: 500 },
    );
  }

  const { id } = await params;
  const result = resumeMenuItem(id);

  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 409;
    const message =
      result.error === "not_found"
        ? "Menu item not found"
        : "Menu item with zero stock cannot be resumed";

    return Response.json({ message }, { status });
  }

  return Response.json(result.item);
}
