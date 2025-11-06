"use client";

import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  section?: string;
}

interface SideNavProps {
  items: NavItem[];
  collapsed?: boolean;
  activeHref?: string;
  onToggle?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Squad: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Simulate: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Report: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Onboarding: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

export function SideNav({ items, collapsed = false, activeHref, onToggle }: SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const isActive = (href: string) => {
    if (activeHref) return pathname === activeHref;
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const navContent = (
    <nav
      className={clsx(
        "flex flex-col h-full bg-[#0d0d0d] border-r border-[#2b2b2b] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Brand */}
      <div className={clsx("p-4 border-b border-[#2b2b2b]", collapsed && "px-2")}>
        {!collapsed ? (
          <NextLink
            href="/dashboard"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#ff7a00] rounded"
          >
            <Image
              src="/SpawnerAI_Logo.png"
              alt="Spawner AI"
              width={120}
              height={40}
              className="h-6 w-auto"
              priority
            />
          </NextLink>
        ) : (
          <NextLink
            href="/dashboard"
            className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#ff7a00] rounded"
          >
            <Image
              src="/SpawnerAI_Logo.png"
              alt="Spawner AI"
              width={40}
              height={40}
              className="h-8 w-8 object-contain"
              priority
            />
          </NextLink>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          <div key={section} className={clsx(!collapsed && "px-4 mb-6")}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-[#cfcfcf] uppercase tracking-wider mb-2 px-2">
                {section}
              </h3>
            )}
            <div className="space-y-1">
              {sectionItems.map((item) => {
                const active = isActive(item.href);
                const Icon = iconMap[item.label] || iconMap.Dashboard;
                return (
                  <Link
                    key={item.href}
                    as={NextLink}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d]",
                      active
                        ? "bg-[#ff7a00]/20 text-[#ff7a00]"
                        : "text-[#cfcfcf] hover:bg-[#1a1a1a] hover:text-white",
                      collapsed && "justify-center px-2"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={clsx("flex-shrink-0", collapsed && "w-5 h-5")}>
                      {Icon}
                    </span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* My Account - Pinned Bottom */}
      <div className="border-t border-[#2b2b2b] p-4">
        <Dropdown placement="top-start">
          <DropdownTrigger>
            <button
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#cfcfcf] hover:bg-[#1a1a1a] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d]",
                collapsed && "justify-center"
              )}
              aria-label="My Account"
            >
              <Avatar
                size="sm"
                name="User"
                className="bg-[#ff7a00] text-white"
              />
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">My Account</div>
                </div>
              )}
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Account menu"
            onAction={(key) => {
              if (key === "settings") {
                router.push("/account");
              } else if (key === "logout") {
                // Mock logout
                router.push("/login");
              }
            }}
          >
            <DropdownItem key="settings">Settings</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </nav>
  );

  // Mobile: Drawer
  return (
    <>
      <Button
        isIconOnly
        variant="light"
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0d0d0d] text-white"
        onPress={() => setIsMobileOpen(true)}
        aria-label="Open navigation"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={clsx(
          "fixed left-0 top-0 h-full z-50 transition-transform duration-300 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </div>
      <div className="hidden md:block">{navContent}</div>
    </>
  );
}

