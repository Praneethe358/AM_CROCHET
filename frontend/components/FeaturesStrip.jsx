import { Truck, ShieldCheck, HeadphonesIcon, CreditCard } from "lucide-react";
import Container from "./Container";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Available on all prepaid orders.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Encrypted & safe payment gateways.",
  },
  {
    icon: HeadphonesIcon,
    title: "Online Support",
    description: "Mon-Sat, 9 AM to 6 PM.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Multiple payment options available.",
  },
];

export default function FeaturesStrip() {
  return (
    <section className="py-5 sm:py-12 border-t border-theme-border bg-theme-bg mt-4 sm:mt-12">
      <Container className="px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-8 auto-rows-fr">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="h-full min-h-[88px] flex items-start gap-2.5 sm:gap-4 justify-start w-full rounded-xl border border-theme-border/70 bg-white/40 px-2.5 py-2.5 sm:min-h-0 sm:px-0 sm:py-0 sm:rounded-none sm:border-0 sm:bg-transparent">
                <div className="flex-shrink-0 flex items-center justify-center p-2 sm:p-3 border border-theme-border rounded-full bg-theme-bg">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-theme-text" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] sm:text-base font-semibold text-theme-text leading-tight">{feature.title}</h4>
                  <p className="text-[12px] sm:text-sm text-theme-muted mt-0.5 leading-snug">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
