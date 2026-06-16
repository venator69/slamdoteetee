import type { NavbarAction, NavbarItem, NavbarLink } from "../navbar";

export const dashboardBrand: NavbarLink = {
  label: "SLAM.et",
  href: "/dashboard",
};

export const dashboardNavItems: NavbarItem[] = [
  { label: "Hub", href: "/dashboard" },
  { label: "Robot", href: "/dashboard/robot" },
  { label: "Drone", href: "/dashboard/drone" },
];

export const dashboardActions: NavbarAction[] = [
  { label: "Home", href: "/", variant: "primary" },
];
