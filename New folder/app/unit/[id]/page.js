"use client";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import UnitDetailPage from "@/components/pages/UnitDetailPage";

export default function UnitDetail() {
  const params = useParams();
  const unitId = params.id;

  return (
    <MainLayout>
      <UnitDetailPage unitId={unitId} />
    </MainLayout>
  );
}
