"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { RoleAffinityBar } from "@/components/ui/RoleAffinityBar";
import { ChampionCard } from "@/components/ui/ChampionCard";
import { calculateRoleAffinity, getChampionsForRole } from "@/types/mock";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

export default function RecommendationsPage() {
  const [roleAffinity, setRoleAffinity] = useState({
    Top: 20,
    Jungle: 20,
    Mid: 20,
    ADC: 20,
    Support: 20,
  });

  useEffect(() => {
    // Calculate role affinity based on mock behaviors
    // In real app, this would use actual fetched data
    const mockBehaviors = {
      aggression: 50,
      positioning: 50,
      utility: 50,
      clutch: 50,
      awareness: 50,
    };
    const affinity = calculateRoleAffinity(mockBehaviors, []);
    setRoleAffinity(affinity);
  }, []);

  const bestRole = Object.entries(roleAffinity).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as
    | "Top"
    | "Jungle"
    | "Mid"
    | "ADC"
    | "Support";

  return (
    <PageShell
      title="Your Recommendations"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]}
      navItems={navItems}
    >
      <div className="space-y-8">
        {/* Role Affinity */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white">Your Role Affinity</h2>
          </CardHeader>
          <CardBody>
            <RoleAffinityBar affinity={roleAffinity} />
            <div className="mt-6 p-4 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b]">
              <p className="text-white font-semibold mb-2">
                Best Fit: <span className="text-[#ff7a00]">{bestRole}</span>
              </p>
              <p className="text-sm text-[#cfcfcf]">
                Based on your playstyle and gaming history, {bestRole} lane is your best match.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Champion Recommendations */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white">Champion Recommendations</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-8">
              {(["Top", "Jungle", "Mid", "ADC", "Support"] as const).map((role) => {
                const champs = getChampionsForRole(role, 5);
                const affinity = roleAffinity[role];
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">{role} Lane</h3>
                      <span className="text-sm text-[#cfcfcf]">
                        {affinity}% match
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {champs.map((champ) => (
                        <ChampionCard key={champ.id} champion={champ} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}

