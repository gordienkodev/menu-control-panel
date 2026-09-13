import { parseMenuFilters } from "@/features/stop-list/model/filters";
import { Filters } from "@/features/stop-list/ui/Filters";
import { StopListTable } from "@/features/stop-list/ui/StopListTable";
import { StopListToast } from "@/features/stop-list/ui/StopListToast";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const filters = parseMenuFilters(await searchParams);

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-950 sm:px-6 sm:py-10 lg:px-8">
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

        <Filters filters={filters} />
        <StopListTable filters={filters} />
        <StopListToast />
      </div>
    </main>
  );
}
