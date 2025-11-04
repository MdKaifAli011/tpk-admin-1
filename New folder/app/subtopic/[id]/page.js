import SubTopicDetailPage from "@/components/pages/SubTopicDetailPage";
import MainLayout from "@/components/layout/MainLayout";

export default async function SubTopicPage({ params }) {
  const { id } = await params;
  return (
    <MainLayout>
      <SubTopicDetailPage subTopicId={id} />
    </MainLayout>
  );
}
