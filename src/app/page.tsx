import { StopListTable } from "@/features/stop-list/ui/StopListTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Управление ассортиментом
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Меню</h1>
          <p className="mt-2 text-sm text-slate-600">
            Текущие остатки и состояние позиций по цехам.
          </p>
        </header>

        <StopListTable />
      </div>
    </main>
  );
}
