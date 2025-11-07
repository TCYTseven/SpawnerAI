"use client";

import { SideNav } from "@/components/navigation/SideNav";
import { TopBar } from "@/components/navigation/TopBar";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  section?: string;
}

interface PageShellProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  navItems: NavItem[];
}

export function PageShell({
  children,
  title,
  breadcrumbs,
  actions,
  navItems,
}: PageShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <SideNav
        items={navItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} breadcrumbs={breadcrumbs} actions={actions} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

