const fs = require('fs');
const filePath = 'C:/Users/prane/OneDrive/Desktop/AM CROCHET/frontend/components/FeaturedProducts.jsx';
let code = fs.readFileSync(filePath, 'utf8');

const newGrid = \        {/* Modern 3-Column Luxury Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-6 md:gap-x-8">
          {cards.map((card, idx) => {
            const targetHref = card.id && !String(card.id).startsWith("featured-") ? \\\/products/\\\\ : "/products";

            return (
              <article key={card.id} className="flex flex-col group cursor-pointer">
                <Link
                  href={targetHref}
                  className="relative overflow-hidden bg-gray-50 mb-6 aspect-[3/4] w-full block"
                >
                  <Image
                    src={card.image}
                    alt={card.name || "Featured collection"}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Subtle hovering vignette */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </Link>

                <div className="mt-6 flex flex-col items-center text-center px-4">
                  <h3 className="text-sm md:text-base font-medium tracking-[0.15em] text-black">
                    {card.name.toUpperCase()}
                  </h3>
                  <div className="mt-4 mb-4 h-px w-6 bg-gray-300 transition-all duration-300 group-hover:w-12 group-hover:bg-black"></div>
                  <Link
                    href={targetHref}
                    className="text-[10px] md:text-xs tracking-widest text-gray-500 hover:text-black transition-all duration-300 uppercase"
                  >
                    EXPLORE COLLECTION
                  </Link>
                </div>
              </article>
            );
          })}
        </div>\;

code = code.replace(/\{\/\*\s*1 or 2 Col Vertical Layout - Luxury Look[\s\S]*?(?=\<\/div>\s*\<\/section>)/, newGrid + '\n      </div>');
fs.writeFileSync(filePath, code);
console.log("Updated FeaturedProducts.jsx!");
