import { AgencyTheme } from "@/components/admin/agency-theme";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AgencyTheme>{children}</AgencyTheme>;
}
