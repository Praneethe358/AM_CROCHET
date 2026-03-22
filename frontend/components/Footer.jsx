import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] text-gray-400 py-12 md:py-20 mt-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
          
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-white text-3xl font-serif font-bold tracking-tight">AM CROCHET</h3>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-8">
              Premium handcrafted bags designed for everyday style and durability. 
              Elevate your carry with our signature crochet collection.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Collections</Link></li>
              <li><Link href="/products?category=handbags" className="hover:text-white transition-colors">Handbags</Link></li>
              <li><Link href="/products?category=backpacks" className="hover:text-white transition-colors">Backpacks</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Account Column */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Customer Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Reach Out</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gray-500" />
                <span>hello@amcrochet.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gray-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-500 mt-1" />
                <span className="leading-relaxed">Hyderabad, India</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs uppercase tracking-[0.2em]">
          <p>&copy; {currentYear} AM CROCHET. Built with passion.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
