import type {
  NavbarAction,
  NavbarItem,
  NavbarLink,
} from "../navbar";

export const brand: NavbarLink = {
  label: "SLAM.et",
  href: "/",
};

export const navItems: NavbarItem[] = [
  { label: "Main", href: "#main" },
  {
    label: "Demo",
    href: "#Demo",
    children: [
      { label: "How it works", href: "#How it works" },
      { label: "SLAM Visualization", href: "#Slam Visualization" },
      { label: "Specifications", href: "#Testbench" },
      { label: "Semantic Mapping", href: "#Semantic Mapping" },
    ],
  },
  { label: "Testbench", href: "#Testbench" },
  { label: "Github", href: "#github" },
  { label: "Contacts", href: "#contacts" },
];

export const guestActions: NavbarAction[] = [
  { label: "Get Started", href: "/login", variant: "primary" },
  { label: "Log In", href: "/login", variant: "secondary" },
];

export const userActions: NavbarAction[] = [
  { label: "Dashboard", href: "/dashboard", variant: "primary" },
];
