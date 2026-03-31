import { Truck, ShieldCheck, HeadphonesIcon, CreditCard } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const features = [
  {
    icon: Truck,
    title: "COMPLIMENTARY SHIPPING",
    description: "Worldwide delivery on all primary orders.",
  },
  {
    icon: ShieldCheck,
    title: "SECURE CHECKOUT",
    description: "Encrypted & safe payment gateways.",
  },
  {
    icon: HeadphonesIcon,
    title: "CLIENT SERVICES",
    description: "Dedicated support, Mon-Sat.",
  },
  {
    icon: CreditCard,
    title: "FLEXIBLE PAYMENTS",
    description: "Multiple premium payment options.",
  },
];

export default function FeaturesStrip() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-8 md:py-16 bg-[#FAFAFA] border-t border-gray-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-12 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: prefersReducedMotion ? 0.12 : 0.42, delay: prefersReducedMotion ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-3 sm:mb-5 text-black transition-transform duration-500 group-hover:-translate-y-1">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" strokeWidth={1} />
                </div>
                <h4 className="text-[9px] sm:text-[10px] md:text-xs font-medium tracking-[0.12em] sm:tracking-[0.2em] text-black uppercase mb-2 sm:mb-3">
                  {feature.title}
                </h4>
                <p className="text-[11px] sm:text-xs md:text-sm font-light text-gray-500 max-w-[160px] sm:max-w-[200px] mx-auto leading-snug sm:leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
