"use client";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ExamDetailPage from "@/components/pages/ExamDetailPage";

export default function ExamDetail() {
  const params = useParams();
  const examId = params.id;

  return (
    <MainLayout>
      <ExamDetailPage examId={examId} />
    </MainLayout>
  );
}

