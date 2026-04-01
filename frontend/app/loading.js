export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-theme-bg">
      {/* Hero skeleton */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] animate-pulse bg-theme-secondary/70" />

      {/* Thematic banner skeleton */}
      <section className="bg-theme-bg py-4 sm:py-10">
        <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
          <div className="h-[290px] sm:h-[360px] animate-pulse rounded-none sm:rounded-3xl bg-theme-secondary/70" />
        </div>
      </section>

      {/* Promotions skeleton */}
      <section className="bg-theme-bg px-3 py-6 md:px-8 md:py-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-4 h-8 w-44 animate-pulse rounded-lg bg-theme-secondary/70 mx-auto" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square w-full animate-pulse rounded-xl bg-theme-secondary/70" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured skeleton */}
      <section className="bg-theme-bg py-12 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16">
          <div className="mb-8 flex justify-center">
            <div className="h-8 w-52 animate-pulse rounded-lg bg-theme-secondary/70" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
            <div className="aspect-[16/9] md:aspect-[21/9] md:col-span-2 animate-pulse rounded-xl bg-theme-secondary/70" />
            <div className="aspect-[16/9] animate-pulse rounded-xl bg-theme-secondary/70" />
          </div>
        </div>
      </section>
    </div>
  );
}
