export default function OgPreview() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-shell p-8">
      <div className="aspect-[1200/630] w-full max-w-[1200px] overflow-hidden rounded-xl border border-ink-200">
        <img src="/opengraph-image" alt="OG preview" className="h-full w-full" />
      </div>
    </main>
  );
}
