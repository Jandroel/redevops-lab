import { ReportPageClient } from "@/components/report/report-page-client";

interface ReportByIdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportByIdPage({ params }: ReportByIdPageProps) {
  const { id } = await params;

  return <ReportPageClient reportId={id} />;
}
