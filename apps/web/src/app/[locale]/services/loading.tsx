export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:py-10">
      <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-nl-pearl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr] lg:gap-8">
        <div className="h-72 animate-pulse rounded-2xl bg-nl-pearl" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-nl-cacao/10 bg-nl-linen">
              <div className="aspect-[4/3] animate-pulse bg-nl-pearl" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/2 animate-pulse rounded bg-nl-pearl" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-nl-pearl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
