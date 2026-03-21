import Container from "./Container";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 sm:py-12 mt-6 sm:mt-20">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 mb-5 sm:mb-8">
          {/* Column 1 */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2.5">BagStore</h3>
            <p className="text-gray-400 max-w-xs text-sm sm:text-[15px] leading-6 sm:leading-8">
              Premium handcrafted bags designed for everyday style and durability. Elevate your carry.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-2.5">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-semibold mb-2.5">Connect</h4>
            <div className="flex space-x-2.5 sm:space-x-4">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs sm:text-sm hover:bg-gray-700 transition-colors">IG</a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs sm:text-sm hover:bg-gray-700 transition-colors">TW</a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs sm:text-sm hover:bg-gray-700 transition-colors">FB</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-4 sm:pt-8 text-center text-[11px] sm:text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} BagStore. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
