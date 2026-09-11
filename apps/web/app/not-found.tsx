import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <div className="mb-3 font-mono text-[11px] tracking-widest text-primary uppercase">
          404
        </div>
        <h1
          className="font-serif text-[36px] leading-tight font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Nothing here.
        </h1>
        <p className="mx-auto mt-3 max-w-75 font-sans text-sm text-ink-500">
          That page doesn&apos;t exist. Might be a typo in the URL, or something
          we haven&apos;t built yet.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="font-sans text-sm font-semibold text-primary hover:underline"
      >
        Go home →
      </Link>
    </main>
  );
}
