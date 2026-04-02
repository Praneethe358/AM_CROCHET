import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";
import { buildCategoryPath } from "@/utils/seo";

const WhatsappIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const WHATSAPP_PHONE = "918220423270";
  const WHATSAPP_MESSAGE = "Hi, I'm interested in your crochet bags. Could you please share more details about availability and pricing?";
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <footer className="bg-[#0a0a0a] text-gray-400 py-12 md:py-20 mt-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
          
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Logo
              variant="light"
              className="mb-6"
              imageClassName="h-7 md:h-8 lg:h-9"
              showText
              textClassName="text-[11px] text-white/90"
              alt="AM Crochet Bags footer logo"
              ariaLabel="AM Crochet Bags home"
            />
            <p className="text-sm leading-relaxed max-w-sm mb-8">
              AM Crochet Bags creates premium handmade crochet bags designed for everyday style and durability.
              Elevate your carry with our signature collection.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/am_crochet_bag?igsh=MTNqbWU3NHR4MDFkag=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                <WhatsappIcon size={18} />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Collections</Link></li>
              <li><Link href={buildCategoryPath("handbags")} className="hover:text-white transition-colors">Handbags</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Crochet Blog</Link></li>
            </ul>
          </div>

          {/* Account Column */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Customer Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In / Register</Link></li>
              <li><Link href="/about-am-crochet-bags" className="hover:text-white transition-colors">About AM Crochet Bags</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Reach Out</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gray-500" />
                <span>amcrochet2026@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gray-500" />
                <span>+91 82204 23270</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-500 mt-1" />
                <span className="leading-relaxed">Coimbatore, India</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs uppercase tracking-[0.2em]">
          <p>&copy; {currentYear} AM Crochet Bags. Built with passion.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
