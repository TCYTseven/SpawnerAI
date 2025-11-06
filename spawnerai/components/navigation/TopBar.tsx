"use client";

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import clsx from "clsx";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function TopBar({ title, breadcrumbs, actions }: TopBarProps) {
  return (
    <div className="w-full border-b border-[#2b2b2b] bg-[#0d0d0d] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-[#2b2b2b]">/</span>}
                  {crumb.href ? (
                    <Link
                      as={NextLink}
                      href={crumb.href}
                      className="text-[#cfcfcf] hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

