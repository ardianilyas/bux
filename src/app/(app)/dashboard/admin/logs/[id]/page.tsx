import { AuditLogDetailView } from "@/features/audit/components/audit-log-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AuditLogDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <AuditLogDetailView logId={id} />
    </div>
  );
}
