import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { brand, guestActions, navItems, userActions } from "../config/nav";
import AppNavbar, { type NavbarAction } from "../navbar";

export function SiteLayout() {
  const { user, logout } = useAuth();

  const actions: NavbarAction[] = user
    ? [
        ...userActions,
        {
          label: "Log out",
          href: "/",
          variant: "secondary",
          onClick: logout,
        },
      ]
    : guestActions;

  return (
    <>
      <AppNavbar brand={brand} items={navItems} actions={actions} />
      <Outlet />
    </>
  );
}
