import TopicDetailPage from "@/components/pages/TopicDetailPage";
import MainLayout from "@/components/layout/MainLayout";

export default async function TopicPage({ params }) {
  const { id } = await params;
  return (
    <MainLayout>
      <TopicDetailPage topicId={id} />
    </MainLayout>
  );
}
