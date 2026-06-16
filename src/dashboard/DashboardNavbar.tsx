import AppNavbar from "../navbar";
import { dashboardActions, dashboardBrand, dashboardNavItems } from "./nav";

export function DashboardNavbar() {
  return (
    <AppNavbar
      brand={dashboardBrand}
      items={dashboardNavItems}
      actions={dashboardActions}
    />
  );
}
