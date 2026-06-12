import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../brand";
import { authLinkClass } from "./auth-styles";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 px-4 py-24">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl shadow-slate-900/10 backdrop-blur">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block text-3xl">
            <BrandLogo inverted />
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        {children}

        <p className="mt-8 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link to={footerLinkTo} className={authLinkClass}>
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
