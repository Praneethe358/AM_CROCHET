export default function Loading() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 animate-pulse">
          {/* Left side: Image skeleton */}
          <div className="aspect-square md:aspect-[4/5] bg-gray-100 rounded-[2rem]"></div>
          
          {/* Right side: Details skeleton */}
          <div className="flex flex-col justify-center py-6 md:py-0">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-14 w-3/4 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-px bg-gray-100 w-full mb-8"></div>
            
            <div className="space-y-3 mb-10">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
            
            <div className="h-12 w-32 bg-gray-200 rounded-full mb-10"></div>
            <div className="h-16 w-full sm:w-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}