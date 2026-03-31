function PulseBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-theme-secondary/70 ${className}`} />;
}

export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="bg-theme-bg">
      <section className="relative h-[100dvh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="absolute bottom-0 left-0 w-full p-6 pb-28 md:p-16 md:pb-24">
          <PulseBlock className="mb-4 h-3 w-28 rounded-full bg-white/30" />
          <PulseBlock className="mb-4 h-10 w-56 bg-white/40 md:h-14 md:w-96" />
          <PulseBlock className="mb-10 h-4 w-64 bg-white/30 md:w-80" />
          <PulseBlock className="h-11 w-40 bg-white/40" />
        </div>
      </section>

      <section className="bg-theme-bg py-4 sm:py-10">
        <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-none border-0 bg-theme-secondary sm:rounded-3xl sm:border sm:border-theme-border">
            <div className="grid min-h-[290px] items-center md:min-h-[360px] md:grid-cols-2">
              <PulseBlock className="h-[220px] w-full rounded-none sm:h-[360px]" />
              <div className="p-4 sm:p-8 md:p-10">
                <PulseBlock className="mb-3 h-3 w-24" />
                <PulseBlock className="mb-3 h-9 w-56" />
                <PulseBlock className="mb-2 h-4 w-full" />
                <PulseBlock className="mb-5 h-4 w-3/4" />
                <PulseBlock className="h-10 w-36" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-theme-bg px-3 py-6 md:px-8 md:py-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center md:mb-6">
            <div />
            <PulseBlock className="h-8 w-40 justify-self-center" />
            <div />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
            <PulseBlock className="aspect-square w-full" />
            <PulseBlock className="aspect-square w-full" />
            <PulseBlock className="aspect-square w-full" />
            <PulseBlock className="aspect-square w-full" />
          </div>
        </div>
      </section>

      <section className="bg-theme-bg py-12 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16">
          <div className="mb-8 flex justify-center">
            <PulseBlock className="h-8 w-56" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
            <PulseBlock className="aspect-[16/9] w-full md:aspect-[21/9]" />
            <PulseBlock className="aspect-[16/9] w-full" />
            <PulseBlock className="aspect-[16/9] w-full" />
          </div>
        </div>
      </section>
    </main>
  );
}