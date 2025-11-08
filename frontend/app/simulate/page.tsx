"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { RoleAffinityBar } from "@/components/ui/RoleAffinityBar";
import { ChampionCard } from "@/components/ui/ChampionCard";
import { useState } from "react";
import { mockPlayers, getChampionsForRole, calculateRoleAffinity } from "@/types/mock";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
];

export default function SimulatePage() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(mockPlayers[0]?.id || "");
  const [targetRole, setTargetRole] = useState<string>("");
  const [biases, setBiases] = useState({
    moreEngage: false,
    morePeel: false,
    moreScaling: false,
  });

  const selectedPlayer = mockPlayers.find((p) => p.id === selectedPlayerId);
  const baseAffinity = selectedPlayer
    ? selectedPlayer.roleAffinity
    : {
        Top: 20,
        Jungle: 20,
        Mid: 20,
        ADC: 20,
        Support: 20,
      };

  // Adjust affinity based on biases
  const adjustedAffinity = { ...baseAffinity };
  if (targetRole && targetRole in adjustedAffinity) {
    adjustedAffinity[targetRole as keyof typeof adjustedAffinity] += 20;
  }
  if (biases.moreEngage) {
    adjustedAffinity.Top += 5;
    adjustedAffinity.Jungle += 5;
  }
  if (biases.morePeel) {
    adjustedAffinity.Support += 10;
  }
  if (biases.moreScaling) {
    adjustedAffinity.Top += 5;
    adjustedAffinity.ADC += 5;
    adjustedAffinity.Mid += 5;
  }

  // Normalize
  const total = Object.values(adjustedAffinity).reduce((sum, val) => sum + val, 0);
  const normalizedAffinity = Object.entries(adjustedAffinity).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: Math.min(100, Math.round((value / total) * 100)),
    }),
    {} as typeof adjustedAffinity
  );

  const previewChampions = targetRole
    ? getChampionsForRole(targetRole as "Top" | "Jungle" | "Mid" | "ADC" | "Support", 6)
    : [];

  return (
    <PageShell
      title="Simulate"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulate" }]}
      navItems={navItems}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Controls */}
        <div className="space-y-6">
          <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Simulation Controls</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Select Player
                </label>
                <Select
                  selectedKeys={selectedPlayerId ? [selectedPlayerId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedPlayerId(selected);
                  }}
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                  }}
                  aria-label="Select player"
                >
                  {mockPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.username}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Target Role
                </label>
                <Select
                  selectedKeys={targetRole ? [targetRole] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setTargetRole(selected);
                  }}
                  placeholder="Select a role"
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                  }}
                  aria-label="Target role"
                >
                  <SelectItem key="Top">Top</SelectItem>
                  <SelectItem key="Jungle">Jungle</SelectItem>
                  <SelectItem key="Mid">Mid</SelectItem>
                  <SelectItem key="ADC">ADC</SelectItem>
                  <SelectItem key="Support">Support</SelectItem>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#2b2b2b]">
                <p className="text-sm font-medium text-white">Biases</p>
                <Switch
                  isSelected={biases.moreEngage}
                  onValueChange={(val) => setBiases({ ...biases, moreEngage: val })}
                  aria-label="More engage bias"
                >
                  More Engage
                </Switch>
                <Switch
                  isSelected={biases.morePeel}
                  onValueChange={(val) => setBiases({ ...biases, morePeel: val })}
                  aria-label="More peel bias"
                >
                  More Peel
                </Switch>
                <Switch
                  isSelected={biases.moreScaling}
                  onValueChange={(val) => setBiases({ ...biases, moreScaling: val })}
                  aria-label="More scaling bias"
                >
                  More Scaling
                </Switch>
              </div>

              <div className="pt-4 border-t border-[#2b2b2b]">
                <p className="text-sm text-[#cfcfcf] italic">
                  Test a jungle-first identity.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right - Preview */}
        <div className="space-y-6">
          <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Live Preview</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Role Affinity</h3>
                <RoleAffinityBar affinity={normalizedAffinity} />
              </div>
              {previewChampions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Champion Recommendations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewChampions.map((champ) => (
                      <ChampionCard key={champ.id} champion={champ} />
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

