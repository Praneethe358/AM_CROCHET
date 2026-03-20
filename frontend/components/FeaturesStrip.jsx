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
    <section className="py-12 border-t border-theme-border bg-theme-bg mt-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center space-x-4 justify-center md:justify-start">
                <div className="flex-shrink-0 flex items-center justify-center p-3 border border-theme-border rounded-full">
                  <Icon className="w-6 h-6 text-theme-text" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-theme-text">{feature.title}</h4>
                  <p className="text-sm text-theme-muted mt-0.5">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
