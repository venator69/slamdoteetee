import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "./brand";

function scrollToSection(href: string) {
  if (href === "/" || href === "#" || href === "") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (!href.startsWith("#")) {
    return;
  }

  const id = decodeURIComponent(href.slice(1));
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export type NavbarLink = {
  label: string;
  href: string;
};

export type NavbarItem = NavbarLink & {
  children?: NavbarLink[];
};

export type NavbarAction = NavbarLink & {
  variant?: "primary" | "secondary";
  onClick?: () => void | Promise<void>;
};

export type AppNavbarProps = {
  brand: NavbarLink;
  items: NavbarItem[];
  actions?: NavbarAction[];
  className?: string;
  autoHide?: boolean;
};

function NavLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <a
      href={href}
      onClick={(event) => onNavigate(event, href)}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </a>
  );
}

function DropdownItem({
  item,
  onNavigate,
}: {
  item: NavbarItem;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!item.children?.length) {
    return (
      <NavLink href={item.href} onNavigate={onNavigate}>
        {item.label}
      </NavLink>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {item.label}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {item.children.map((child) => (
            <a
              key={child.label}
              href={child.href}
              onClick={(event) => {
                onNavigate(event, child.href);
                setOpen(false);
              }}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileDropdownItem({
  item,
  onNavigate,
}: {
  item: NavbarItem;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!item.children?.length) {
    return (
      <a
        href={item.href}
        onClick={(event) => onNavigate(event, item.href)}
        className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="ml-3 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <a
              key={child.label}
              href={child.href}
              onClick={(event) => onNavigate(event, child.href)}
              className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  action,
  onNavigate,
  onAction,
}: {
  action: NavbarAction;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  onAction?: () => void;
}) {
  const isPrimary = action.variant !== "secondary";

  return (
    <a
      href={action.href}
      onClick={(event) => {
        if (action.onClick) {
          event.preventDefault();
          action.onClick();
          onAction?.();
          return;
        }

        onNavigate(event, action.href);
      }}
      className={
        isPrimary
          ? "inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-105 hover:bg-red-300"
          : "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      }
    >
      {action.label}
    </a>
  );
}

const INACTIVITY_MS = 5_000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
] as const;

export function AppNavbar({
  brand,
  items,
  actions = [],
  className = "",
  autoHide = true,
}: AppNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    setNavbarVisible(true);

    if (!autoHide) {
      return;
    }

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (mobileOpen) {
      return;
    }

    inactivityTimerRef.current = setTimeout(() => {
      setNavbarVisible(false);
    }, INACTIVITY_MS);
  }, [autoHide, mobileOpen]);

  const handleNavigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        event.preventDefault();
        const sectionId = decodeURIComponent(href.slice(1));

        if (location.pathname !== "/") {
          navigate({ pathname: "/", hash: sectionId });
        } else {
          scrollToSection(href);
        }

        setMobileOpen(false);
        return;
      }

      if (href === "/") {
        event.preventDefault();

        if (location.pathname === "/") {
          scrollToSection("/");
        } else {
          navigate("/");
        }

        setMobileOpen(false);
        return;
      }

      if (href.startsWith("/")) {
        event.preventDefault();
        navigate(href);
        setMobileOpen(false);
      }
    },
    [location.pathname, navigate],
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!autoHide) {
      setNavbarVisible(true);
      return;
    }

    const handleActivity = () => {
      resetInactivityTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [autoHide, resetInactivityTimer]);

  useEffect(() => {
    if (mobileOpen) {
      setNavbarVisible(true);

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    } else {
      resetInactivityTimer();
    }
  }, [mobileOpen, resetInactivityTimer]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur transition-transform duration-500 ease-in-out will-change-transform ${navbarVisible ? "translate-y-0" : "-translate-y-full"} ${className}`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href={brand.href}
          className="text-lg"
          onClick={(event) => handleNavigate(event, brand.href)}
        >
          <BrandLogo text={brand.label} inverted />
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <DropdownItem
              item={item}
              key={item.label}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {actions.length > 0 && (
          <div className="hidden items-center gap-2 lg:flex">
            {actions.map((action) => (
              <ActionButton
                action={action}
                key={action.label}
                onNavigate={handleNavigate}
                onAction={() => setMobileOpen(false)}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden">
          <div className="space-y-1">
            {items.map((item) => (
              <MobileDropdownItem
                item={item}
                key={item.label}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
          {actions.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {actions.map((action) => (
                <ActionButton
                  action={action}
                  key={action.label}
                  onNavigate={handleNavigate}
                  onAction={() => setMobileOpen(false)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default AppNavbar;
