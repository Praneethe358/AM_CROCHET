"use client";

import PromotionManager from "@/components/admin/PromotionManager";

export default function AdminHomeBannersPage() {
  return (
    <PromotionManager
      pageTitle="Home Banner Slider"
      fixedPlacement="home_thematic_banner"
      description="Manage promotions shown in the homepage thematic banner slider."
    />
  );
}
