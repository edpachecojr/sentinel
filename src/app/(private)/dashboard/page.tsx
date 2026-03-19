import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Dashboard" showNavigation={true} />
      <ComponentCard
        title="Dashboard"
        className="overflow-hidden"
      >
        Dashboard
      </ComponentCard>
    </div>
  );
}
