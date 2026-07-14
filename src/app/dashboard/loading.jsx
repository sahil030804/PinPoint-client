export default function DashboardLoading() {
  return (
    <div className="flex h-screen animate-pulse bg-page">
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-5">
          <div className="h-5 w-20 rounded-lg bg-muted" />
        </div>
        <nav className="space-y-1 p-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/50" />
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end border-b border-border bg-card px-5">
          <div className="h-8 w-8 rounded-full bg-muted" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            <div className="h-6 w-40 rounded-lg bg-muted" />
            <div className="h-4 w-56 rounded-lg bg-muted/50" />
          </div>
        </main>
      </div>
    </div>
  );
}
