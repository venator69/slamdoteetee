import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "../dashboard/DashboardNavbar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <DashboardNavbar />
      <main className="mx-auto max-w-6xl px-4 pb-6 pt-20 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
