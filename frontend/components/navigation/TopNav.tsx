"use client";

import { Button } from "@heroui/button";
import NextLink from "next/link";
import Image from "next/image";

interface NavLink {
  label: string;
  href: string;
}

interface TopNavProps {
  links: NavLink[];
  onCTAClick?: () => void;
}

export function TopNav({ links, onCTAClick }: TopNavProps) {

  return (
    <nav
      className="w-full border-b border-[#2b2b2b] bg-[#0d0d0d]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center">
          {/* Brand */}
          <div className="flex-shrink-0">
            <NextLink
              href="/"
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d] rounded"
              aria-label="Spawner – AI Home"
            >
              <span className="flex items-center">
                <Image
                  src="/SpawnerAI_Logo.png"
                  alt="Spawner AI"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
                <span className="ml-3 text-white text-lg font-semibold">Spawner AI</span>
              </span>
            </NextLink>
          </div>

          {/* Centered Label */}
          <div className="flex-1 flex justify-center items-center">
            <h1 className="text-white text-xl font-bold"></h1>
          </div>

          {/* CTA Buttons */}
          <div className="flex-shrink-0 flex items-center gap-4">
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

