export default function Loading() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title skeleton */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="h-6 w-96 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        {/* Grid skeleton */}
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 gap-x-8 lg:grid-cols-4 xl:gap-x-10 w-full animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4"></div>
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}