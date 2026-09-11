export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2.5 font-sans text-[13px] text-danger"
    >
      {message}
    </div>
  );
}
