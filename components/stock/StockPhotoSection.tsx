"use client";

import { Images } from "lucide-react";
import SectionAccordion from "./SectionAccordion";
import StockPhotoUploader from "./StockPhotoUploader";
import { StockVehicule } from "./stock.types";

interface Props {
  v: StockVehicule;
  onCoverChange?: (url: string | null) => void;
}

export default function StockPhotoSection({ v, onCoverChange }: Props) {
  return (
    <SectionAccordion icon={Images} title="Photos du véhicule">
      <StockPhotoUploader vehiculeId={v.id} onCoverChange={onCoverChange} />
    </SectionAccordion>
  );
}