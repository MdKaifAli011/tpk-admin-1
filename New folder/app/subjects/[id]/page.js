"use client";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import SubjectDetailPage from "@/components/pages/SubjectDetailPage";

export default function SubjectDetail() {
  const params = useParams();
  const subjectId = params.id;

  return (
    <MainLayout>
      <SubjectDetailPage subjectId={subjectId} />
    </MainLayout>
  );
}
