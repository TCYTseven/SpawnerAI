"use client";

import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";

interface NavLink {
  label: string;
  href: string;
}

interface TopNavProps {
  links: NavLink[];
  onCTAClick?: () => void;
}

export function TopNav({ links, onCTAClick }: TopNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="w-full border-b border-[#2b2b2b] bg-[#0d0d0d]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <NextLink
            href="/"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d] rounded"
            aria-label="Spawner – AI Home"
          >
            <Image
              src="/SpawnerAI_Logo.png"
              alt="Spawner AI"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </NextLink>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href.startsWith("#") && false);
              return (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  className={clsx(
                    "text-[#cfcfcf] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d] rounded px-2 py-1",
                    isActive && "text-[#ff7a00] border-b-2 border-[#ff7a00]"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Button
              as={NextLink}
              href="/login"
              variant="light"
              className="text-[#cfcfcf] hover:text-white hidden sm:flex"
            >
              Log in
            </Button>
            <Button
              as={NextLink}
              href="/signup"
              className="bg-[#ff7a00] text-white hover:bg-[#ff8a20] focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d]"
              onClick={onCTAClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

