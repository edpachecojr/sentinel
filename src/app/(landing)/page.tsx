import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Início" showNavigation={true} />
      <ComponentCard
        title="Início"
        className="overflow-hidden"
      >
        Início
      </ComponentCard>
    </div>
  );
}
