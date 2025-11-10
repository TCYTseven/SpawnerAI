"use client";

export const dynamic = "force-dynamic";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Spinner } from "@heroui/spinner";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Input } from "@heroui/input";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { getSquadMembers, getSuggestedRole, getAffinity } from "@/lib/api";
import { mockChampions, getChampionsForRole } from "@/types/mock";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Recommendations", href: "/recommendations", section: "Team" },
];

interface SquadMemberData {
  email: string;
  riot_name?: string;
  riot_id?: string;
  is_self: boolean;
}

type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

export default function SimulatePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const championId = searchParams.get("champion");
  
  const [members, setMembers] = useState<SquadMemberData[]>([]);
  const [selectedPlayerEmail, setSelectedPlayerEmail] = useState<string>("");
  const [targetRole, setTargetRole] = useState<Role>("Mid");
  const [moreEngage, setMoreEngage] = useState(false);
  const [morePeel, setMorePeel] = useState(false);
  const [moreScaling, setMoreScaling] = useState(false);
  const [customIdentity, setCustomIdentity] = useState("");
  const [playerAffinity, setPlayerAffinity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlayerEmail) {
      loadPlayerAffinity();
    }
  }, [selectedPlayerEmail]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: squadData, error: squadError } = await getSquadMembers();
      if (squadError || !squadData?.members) {
        setError(squadError?.message || "Failed to load squad members");
        setLoading(false);
        return;
      }

      setMembers(squadData.members);
      
      // Set default selected player to first member (or self if available)
      const selfMember = squadData.members.find(m => m.is_self);
      const defaultMember = selfMember || squadData.members[0];
      if (defaultMember) {
        setSelectedPlayerEmail(defaultMember.email);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerAffinity = async () => {
    try {
      const { data, error } = await getSuggestedRole(selectedPlayerEmail);
      if (!error && data) {
        setPlayerAffinity(data.affinity);
      } else {
        // Fallback: try to get affinity for current user
        const { data: affinityData } = await getAffinity();
        if (affinityData?.league?.affinity) {
          setPlayerAffinity(affinityData.league.affinity);
        }
      }
    } catch (err) {
      console.error("Error loading player affinity:", err);
    }
  };

  // Calculate preview affinity based on biases
  const previewAffinity = useMemo(() => {
    if (!playerAffinity) {
      return {
        Top: 0,
        Jungle: 0,
        Mid: 0,
        ADC: 0,
        Support: 0,
      };
    }

    const baseAffinity = {
      Top: Math.round(playerAffinity.tank || 0),
      Jungle: Math.round(playerAffinity.scout || 0),
      Mid: Math.round(playerAffinity.offense || 0),
      ADC: Math.round(playerAffinity.hybrid || 0),
      Support: Math.round(playerAffinity.support || 0),
    };

    // Apply biases
    let adjusted = { ...baseAffinity };
    
    if (moreEngage) {
      adjusted.Mid = Math.min(100, adjusted.Mid + 10);
      adjusted.Top = Math.min(100, adjusted.Top + 5);
      adjusted.Support = Math.min(100, adjusted.Support + 5);
    }
    
    if (morePeel) {
      adjusted.Support = Math.min(100, adjusted.Support + 15);
      adjusted.Top = Math.min(100, adjusted.Top + 5);
    }
    
    if (moreScaling) {
      adjusted.ADC = Math.min(100, adjusted.ADC + 10);
      adjusted.Mid = Math.min(100, adjusted.Mid + 5);
    }

    return adjusted;
  }, [playerAffinity, moreEngage, morePeel, moreScaling]);

  // Get champion recommendations
  const championRecommendations = useMemo(() => {
    const champs = getChampionsForRole(targetRole, 3);
    
    // Calculate fit scores based on biases and role
    return champs.map(champ => {
      let fitScore = 70; // Base score
      
      // Adjust based on biases
      if (moreEngage && champ.tags.includes("Engage")) {
        fitScore += 15;
      }
      if (morePeel && champ.tags.includes("Peel")) {
        fitScore += 10;
      }
      if (moreScaling && champ.tags.includes("Scaling")) {
        fitScore += 15;
      }
      
      // Adjust based on role match
      if (champ.role === targetRole) {
        fitScore += 5;
      }
      
      return {
        ...champ,
        fitScore: Math.min(100, fitScore),
      };
    }).sort((a, b) => b.fitScore - a.fitScore);
  }, [targetRole, moreEngage, morePeel, moreScaling]);

  if (loading) {
    return (
      <PageShell
        title="Simulate"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulate" }]}
        navItems={navItems}
      >
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" color="warning" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Simulate"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulate" }]}
        navItems={navItems}
      >
        <Card className="bg-[#1a1a1a] border-2 border-red-500/50">
          <CardBody>
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              <p className="font-semibold mb-2">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardBody>
        </Card>
      </PageShell>
    );
  }

  const selectedPlayer = members.find(m => m.email === selectedPlayerEmail);
  const playerDisplayName = selectedPlayer 
    ? (selectedPlayer.riot_name || selectedPlayer.email.split("@")[0]) + (selectedPlayer.riot_id ? `#${selectedPlayer.riot_id}` : "")
    : "Select Player";

  return (
    <PageShell
      title="Simulate"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulate" }]}
      navItems={navItems}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Controls - Left Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                <h2 className="text-xl font-bold text-white">Simulation Controls</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Select Player */}
              <div>
                <label className="text-sm text-[#cfcfcf] mb-2 block">Select Player</label>
                <Select
                  selectedKeys={selectedPlayerEmail ? [selectedPlayerEmail] : []}
                  onSelectionChange={(keys) => {
                    const email = Array.from(keys)[0] as string;
                    setSelectedPlayerEmail(email);
                  }}
                  className="w-full"
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                  }}
                >
                  {members.map((member) => (
                    // @ts-ignore-next-line
                    <SelectItem 
                      key={member.email}
                      textValue={member.riot_name || member.email}
                    >
                      {member.riot_name || member.email.split("@")[0]}
                      {member.riot_id && `#${member.riot_id}`}
                      {member.is_self && " (You)"}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Target Role */}
              <div>
                <label className="text-sm text-[#cfcfcf] mb-2 block">Target Role</label>
                <Select
                  selectedKeys={[targetRole]}
                  onSelectionChange={(keys) => {
                    const role = Array.from(keys)[0] as Role;
                    setTargetRole(role);
                  }}
                  className="w-full"
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                  }}
                >
                  {/* @ts-ignore-next-line */}
                  <SelectItem key="Top">Top</SelectItem>
                  {/* @ts-ignore-next-line */}
                  <SelectItem key="Jungle">Jungle</SelectItem>
                  {/* @ts-ignore-next-line */}
                  <SelectItem key="Mid">Mid</SelectItem>
                  {/* @ts-ignore-next-line */}
                  <SelectItem key="ADC">ADC</SelectItem>
                  {/* @ts-ignore-next-line */}
                  <SelectItem key="Support">Support</SelectItem>
                </Select>
              </div>

              {/* Biases */}
              <div>
                <label className="text-sm text-[#cfcfcf] mb-3 block">Biases</label>
                <div className="space-y-3">
                  <Switch
                    isSelected={moreEngage}
                    onValueChange={setMoreEngage}
                    classNames={{
                      base: "flex justify-between items-center",
                      label: "text-[#cfcfcf]",
                    }}
                  >
                    More Engage
                  </Switch>
                  <Switch
                    isSelected={morePeel}
                    onValueChange={setMorePeel}
                    classNames={{
                      base: "flex justify-between items-center",
                      label: "text-[#cfcfcf]",
                    }}
                  >
                    More Peel
                  </Switch>
                  <Switch
                    isSelected={moreScaling}
                    onValueChange={setMoreScaling}
                    classNames={{
                      base: "flex justify-between items-center",
                      label: "text-[#cfcfcf]",
                    }}
                  >
                    More Scaling
                  </Switch>
                </div>
              </div>

              {/* Custom Identity Input */}
              <div>
                <Input
                  placeholder="Test a jungle-first identity."
                  value={customIdentity}
                  onValueChange={setCustomIdentity}
                  className="w-full"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Panel - Live Preview and Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                <h2 className="text-xl font-bold text-white">Live Preview</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#cfcfcf] uppercase tracking-wide">Role Affinity</h3>
                {(["Top", "Jungle", "Mid", "ADC", "Support"] as Role[]).map((role) => (
                  <div key={role} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white">{role}</span>
                      <span className="text-sm text-[#ff7a00] font-semibold">{previewAffinity[role]}%</span>
                    </div>
                    <Progress
                      value={previewAffinity[role]}
                      className="w-full"
                      size="sm"
                      classNames={{
                        indicator: "bg-[#ff7a00]",
                        track: "bg-[#0d0d0d]",
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Champion Recommendations */}
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                <h2 className="text-xl font-bold text-white">Champion Recommendations</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {championRecommendations.map((champ) => (
                  <Card key={champ.id} className="bg-[#0d0d0d] border border-[#2b2b2b]">
                    <CardBody className="p-4">
                      <div className="aspect-square bg-[#1a1a1a] rounded-lg border-2 border-[#2b2b2b] flex items-center justify-center mb-3">
                        <div className="text-3xl">🎮</div>
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{champ.name}</div>
                      <div className="text-xs text-[#cfcfcf] mb-2">{champ.role}</div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {champ.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            size="sm"
                            className="bg-[#1a1a1a] text-[#cfcfcf] text-xs"
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                      <div className="text-xs text-[#ff7a00] font-semibold">
                        Fit Score: {champ.fitScore}%
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
