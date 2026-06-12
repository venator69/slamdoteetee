declare module "@material-tailwind/react" {
  import type { ComponentType, ReactNode } from "react";

  type ComponentProps = {
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  };

  export const Navbar: ComponentType<ComponentProps>;
  export const Collapse: ComponentType<ComponentProps>;
  export const Typography: ComponentType<ComponentProps>;
  export const Button: ComponentType<ComponentProps>;
  export const IconButton: ComponentType<ComponentProps>;
  export const List: ComponentType<ComponentProps>;
  export const ListItem: ComponentType<ComponentProps>;
  export const Menu: ComponentType<ComponentProps>;
  export const MenuHandler: ComponentType<ComponentProps>;
  export const MenuList: ComponentType<ComponentProps>;
  export const MenuItem: ComponentType<ComponentProps>;
  export const ThemeProvider: ComponentType<ComponentProps>;
}
