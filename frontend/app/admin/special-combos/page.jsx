"use client";

import PromotionManager from "@/components/admin/PromotionManager";

export default function AdminSpecialCombosPage() {
  return (
    <PromotionManager
      pageTitle="Home Special Combos"
      fixedPlacement="special_combos"
      description="Manage promotions shown in the Special Combos section on the homepage."
    />
  );
}
