"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { RoleAffinityBar } from "@/components/ui/RoleAffinityBar";
import { ChampionCard } from "@/components/ui/ChampionCard";
import { getChampionsForRole } from "@/types/mock";
import { useState, useEffect } from "react";
import { getAffinity } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
];

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [roleAffinity, setRoleAffinity] = useState({
    Top: 0,
    Jungle: 0,
    Mid: 0,
    ADC: 0,
    Support: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAffinity = async () => {
      if (!user) {
        setError("Please log in to view your recommendations");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: apiError } = await getAffinity();

        if (apiError) {
          setError(apiError.message || "Failed to fetch affinity data");
          setLoading(false);
          return;
        }

        if (data && data.affinity) {
          // The backend returns playstyle affinities: offense, tank, support, scout, hybrid
          // Map these to League of Legends roles
          const playstyles = data.affinity;
          
          // Map playstyles to League roles
          // This is a simplified mapping - you may want to refine this based on your model
          setRoleAffinity({
            Top: (playstyles.tank || 0) * 0.4 + (playstyles.hybrid || 0) * 0.3 + (playstyles.offense || 0) * 0.3,
            Jungle: (playstyles.scout || 0) * 0.4 + (playstyles.hybrid || 0) * 0.3 + (playstyles.offense || 0) * 0.3,
            Mid: (playstyles.offense || 0) * 0.5 + (playstyles.scout || 0) * 0.3 + (playstyles.hybrid || 0) * 0.2,
            ADC: (playstyles.offense || 0) * 0.6 + (playstyles.hybrid || 0) * 0.4,
            Support: (playstyles.support || 0) * 0.6 + (playstyles.tank || 0) * 0.2 + (playstyles.hybrid || 0) * 0.2,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAffinity();
  }, [user]);

  const bestRole = Object.entries(roleAffinity).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as
    | "Top"
    | "Jungle"
    | "Mid"
    | "ADC"
    | "Support";

  if (loading) {
    return (
      <PageShell
        title="Your Recommendations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]}
        navItems={navItems}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#cfcfcf]">Loading your recommendations...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Your Recommendations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]}
        navItems={navItems}
      >
        <div className="space-y-8">
          <Card className="bg-[#1a1a1a] border-2 border-red-500/50">
            <CardBody>
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                <p className="font-semibold mb-2">Error loading recommendations</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </PageShell>
    );
  }

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
                Based on your Dota 2 and League of Legends match history, {bestRole} lane is your best match.
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

