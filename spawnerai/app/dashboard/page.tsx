"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { InviteBlock } from "@/components/ui/InviteBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockPlayers } from "@/types/mock";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if onboarding is completed, redirect if not
    const onboardingCompleted = typeof window !== "undefined" && localStorage.getItem("spawner_onboarding_completed") === "true";
    if (!onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <PageShell
      title="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
      navItems={navItems}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-xl border-2 border-[#ff7a00]/30 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7a00]/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-xs font-mono text-[#ff7a00] mb-2 uppercase tracking-widest">
              WELCOME BACK
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              Ready to <span className="text-[#ff7a00]">dominate</span>?
            </h2>
            <p className="text-[#cfcfcf]">
              Your squad's waiting. Let's get you set up.
            </p>
          </div>
        </div>

        {/* Your Starter Profile */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b] hover:border-[#ff7a00]/50 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Chip className="bg-gradient-to-r from-[#ff7a00]/20 to-orange-600/20 text-[#ff7a00] border border-[#ff7a00]/30 font-semibold px-4 py-2">
                Valorant Player
              </Chip>
              <Chip className="bg-gradient-to-r from-[#ff7a00]/20 to-orange-600/20 text-[#ff7a00] border border-[#ff7a00]/30 font-semibold px-4 py-2">
                Aggressive
              </Chip>
              <Chip className="bg-gradient-to-r from-[#ff7a00]/20 to-orange-600/20 text-[#ff7a00] border border-[#ff7a00]/30 font-semibold px-4 py-2">
                Mid Lane
              </Chip>
            </div>
            <p className="text-sm text-[#cfcfcf] italic">
              Complete onboarding to unlock your full potential.
            </p>
          </CardBody>
        </Card>

        {/* Invite Your Squad */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#2b2b2b] hover:border-[#ff7a00]/50 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Invite Your Squad</h2>
            </div>
          </CardHeader>
          <CardBody>
            <InviteBlock />
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b] hover:border-[#ff7a00] transition-all cursor-pointer group"
            onPress={() => router.push("/squad")}
          >
            <CardBody className="p-6">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">Your Squad</h3>
              <p className="text-sm text-[#cfcfcf]">See your team's synergy</p>
            </CardBody>
          </Card>
          
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b] hover:border-[#ff7a00] transition-all cursor-pointer group"
            onPress={() => router.push("/simulate")}
          >
            <CardBody className="p-6">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Simulate</h3>
              <p className="text-sm text-[#cfcfcf]">Test different comps</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

