"use client";

import { useAppStore } from "@/lib/store";
import { LoginPage } from "@/components/auth/login-page";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ServicePage } from "@/components/services/service-page";
import { serviceConfigs } from "@/components/services/service-configs";
import { CustomersPage } from "@/components/management/customers-page";
import { EmployeesPage } from "@/components/management/employees-page";
import { AgentsCompaniesPage } from "@/components/management/agents-companies-page";
import { RevenuesExpensesPage } from "@/components/finance/revenues-expenses-page";
import { PaymentsPage } from "@/components/finance/payments-page";
import { InvoicesPage } from "@/components/finance/invoices-page";
import { StatisticsPage } from "@/components/monitoring/statistics-page";
import { AuditLogPage } from "@/components/monitoring/audit-log-page";
import { VisaExpiryPage } from "@/components/monitoring/visa-expiry-page";
import { UsersPermissionsPage } from "@/components/settings/users-permissions-page";
import { SystemSettingsPage } from "@/components/settings/system-settings-page";

export default function Home() {
  const isAuthed = useAppStore((s) => s.isAuthed);
  const currentPage = useAppStore((s) => s.currentPage);

  if (!isAuthed) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <PageRouter page={currentPage} />
    </DashboardLayout>
  );
}

function PageRouter({ page }: { page: string }) {
  // Service pages
  if (serviceConfigs[page]) {
    return <ServicePage config={serviceConfigs[page]} />;
  }

  switch (page) {
    case "dashboard":
      return <DashboardPage />;
    case "customers":
      return <CustomersPage />;
    case "employees":
      return <EmployeesPage />;
    case "agents_companies":
      return <AgentsCompaniesPage />;
    case "revenues_expenses":
      return <RevenuesExpensesPage />;
    case "payments":
      return <PaymentsPage />;
    case "invoices":
      return <InvoicesPage />;
    case "statistics":
      return <StatisticsPage />;
    case "audit_log":
      return <AuditLogPage />;
    case "visa_expiry":
      return <VisaExpiryPage />;
    case "users_permissions":
      return <UsersPermissionsPage />;
    case "system_settings":
      return <SystemSettingsPage />;
    default:
      return <DashboardPage />;
  }
}
