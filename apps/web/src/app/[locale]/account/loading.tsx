export default function AccountLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-40 rounded-lg bg-nl-cacao/[0.07]" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 flex gap-3 rounded-2xl border border-nl-cacao/10 bg-nl-linen"
          >
            <div className="h-12 w-12 shrink-0 rounded-xl bg-nl-cacao/[0.07]" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-1/2 rounded-md bg-nl-cacao/[0.07]" />
              <div className="h-3 w-1/3 rounded-md bg-nl-cacao/[0.07]" />
            </div>
            <div className="h-4 w-16 self-center rounded-full bg-nl-cacao/[0.07]" />
          </div>
        ))}
      </div>
    </div>
  );
}
