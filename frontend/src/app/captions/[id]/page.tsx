import { notFound } from "next/navigation";
import { getCaptionJobById } from "~/actions/captions";
import { CaptionResultViewer } from "~/components/caption-result-viewer";

export const dynamic = "force-dynamic";

interface CaptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaptionPage({ params }: CaptionPageProps) {
  const { id } = await params;
  const job = await getCaptionJobById(id);
  if (!job) notFound();
  return <CaptionResultViewer job={job} />;
}
