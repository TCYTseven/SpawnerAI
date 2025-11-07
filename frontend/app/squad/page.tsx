"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { LeagueMap } from "@/components/ui/LeagueMap";
import { ChampionSelector } from "@/components/ui/ChampionSelector";
import { TeamStrengths } from "@/components/ui/TeamStrengths";
import { SynergyHeatmap } from "@/components/ui/SynergyHeatmap";
import { mockSquad, mockPlayers, mockChampions, Champion } from "@/types/mock";
import { useState, useMemo } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

// Calculate team strengths based on champions
function calculateTeamStrengths(
  champions: Record<string, Champion | undefined>
): { engage: number; peel: number; pick: number; scaling: number } {
  const roles = ["top", "jungle", "mid", "adc", "support"] as const;
  let engage = 0;
  let peel = 0;
  let pick = 0;
  let scaling = 0;

  roles.forEach((role) => {
    const champ = champions[role];
    if (champ) {
      if (champ.tags.includes("Engage")) engage += 20;
      if (champ.tags.includes("Peel")) peel += 20;
      if (champ.tags.includes("Carry")) pick += 20;
      if (champ.tags.includes("Scaling")) scaling += 20;
    }
  });

  return {
    engage: Math.min(100, engage),
    peel: Math.min(100, peel),
    pick: Math.min(100, pick),
    scaling: Math.min(100, scaling),
  };
}

export default function SquadPage() {
  const [squadMembers, setSquadMembers] = useState(mockSquad.members);
  const [selectedPlayerForChamp, setSelectedPlayerForChamp] = useState<string | null>(null);
  const [championSelectorOpen, setChampionSelectorOpen] = useState(false);
  const [playerChampions, setPlayerChampions] = useState<
    Record<string, Champion | undefined>
  >({});

  // Map players to roles and champions (assign each player to their best role, handle conflicts)
  const roleAssignments = useMemo(() => {
    const assignments: Record<string, { player: typeof mockPlayers[0]; champion?: Champion }> = {};
    const usedRoles = new Set<string>();
    
    // Sort members by their highest role affinity to prioritize best fits
    const sortedMembers = [...squadMembers].sort((a, b) => {
      const aMax = Math.max(...Object.values(a.roleAffinity));
      const bMax = Math.max(...Object.values(b.roleAffinity));
      return bMax - aMax;
    });

    sortedMembers.forEach((member) => {
      // Get roles sorted by affinity
      const rolesByAffinity = Object.entries(member.roleAffinity)
        .sort((a, b) => b[1] - a[1])
        .map(([role]) => role.toLowerCase());
      
      // Find first available role
      for (const role of rolesByAffinity) {
        if (!usedRoles.has(role)) {
          assignments[role] = {
            player: member,
            champion: playerChampions[member.id],
          };
          usedRoles.add(role);
          break;
        }
      }
    });
    
    return assignments;
  }, [squadMembers, playerChampions]);

  // Calculate team strengths dynamically
  const teamStrengths = useMemo(() => {
    const champions: Record<string, Champion | undefined> = {};
    Object.entries(roleAssignments).forEach(([role, { champion }]) => {
      if (champion) {
        champions[role] = champion;
      }
    });
    return calculateTeamStrengths(champions);
  }, [roleAssignments]);

  // Map players for League map visualization (use role assignments)
  const mapPlayers = useMemo(() => {
    return Object.entries(roleAssignments).map(([role, { player, champion }]) => {
      const roleUpper = (role.charAt(0).toUpperCase() + role.slice(1)) as "Top" | "Jungle" | "Mid" | "ADC" | "Support";
      const positions: Record<string, { x: number; y: number }> = {
        top: { x: 20, y: 15 },
        jungle: { x: 50, y: 50 },
        mid: { x: 50, y: 50 },
        adc: { x: 20, y: 85 },
        support: { x: 35, y: 85 },
      };
      return {
        id: player.id,
        username: player.username,
        role: roleUpper,
        champion: champion ? { id: champion.id, name: champion.name } : undefined,
        position: positions[role] || { x: 50, y: 50 },
      };
    });
  }, [roleAssignments]);

  const handleKickMember = (memberId: string) => {
    setSquadMembers((prev) => prev.filter((m) => m.id !== memberId));
    setPlayerChampions((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
  };

  const handleSelectChampion = (champion: Champion) => {
    if (selectedPlayerForChamp) {
      setPlayerChampions((prev) => ({
        ...prev,
        [selectedPlayerForChamp]: champion,
      }));
      setSelectedPlayerForChamp(null);
    }
  };

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerForChamp(playerId);
    setChampionSelectorOpen(true);
  };

  const hasMembers = squadMembers.length >= 2;
  const memberLabels = squadMembers.map((m) => m.username);

  return (
    <PageShell
      title="Squad"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Squad" }]}
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Compact Invite Section */}
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#cfcfcf]">Invite Code:</span>
            <code className="text-sm font-mono text-[#ff7a00] bg-[#0d0d0d] px-2 py-1 rounded">
              SPAWN-ABC123
            </code>
            <Button
              size="sm"
              variant="light"
              className="text-[#cfcfcf] hover:text-white"
              onPress={async () => {
                const link = typeof window !== "undefined" ? `${window.location.origin}/squad?invite=SPAWN-ABC123` : `/squad?invite=SPAWN-ABC123`;
                try {
                  await navigator.clipboard.writeText(link);
                } catch (err) {
                  console.error("Failed to copy:", err);
                }
              }}
            >
              Copy Link
            </Button>
          </div>
        </div>

        {hasMembers ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - League Map */}
            <div className="lg:col-span-2 space-y-6">
              <LeagueMap
                players={mapPlayers}
                onPlayerClick={handlePlayerClick}
              />

              {/* Squad Members with Edit Controls */}
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Squad Members</h2>
                </CardHeader>
                <CardBody className="space-y-3">
                  {squadMembers.map((member) => {
                    const bestRole = Object.entries(member.roleAffinity).reduce((a, b) =>
                      a[1] > b[1] ? a : b
                    )[0] as keyof typeof member.roleAffinity;
                    const champion = playerChampions[member.id];
                    const roleKey = bestRole.toLowerCase() as keyof typeof roleAssignments;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-4 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b] hover:border-[#ff7a00]/50 transition-all group"
                      >
                        <Avatar
                          name={member.username}
                          className="bg-gradient-to-br from-[#ff7a00] to-orange-600 text-white font-bold"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-semibold">{member.username}</span>
                            <Chip
                              size="sm"
                              className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b]"
                            >
                              {bestRole}
                            </Chip>
                            {champion && (
                              <Chip
                                size="sm"
                                className="bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/30"
                              >
                                {champion.name}
                              </Chip>
                            )}
                          </div>
                          {!champion && (
                            <Button
                              size="sm"
                              variant="bordered"
                              className="border-[#2b2b2b] text-[#cfcfcf] hover:border-[#ff7a00] hover:text-white text-xs"
                              onPress={() => {
                                setSelectedPlayerForChamp(member.id);
                                setChampionSelectorOpen(true);
                              }}
                            >
                              Select Champion
                            </Button>
                          )}
                          {champion && (
                            <Button
                              size="sm"
                              variant="light"
                              className="text-[#cfcfcf] hover:text-white text-xs"
                              onPress={() => {
                                setSelectedPlayerForChamp(member.id);
                                setChampionSelectorOpen(true);
                              }}
                            >
                              Change Champion
                            </Button>
                          )}
                        </div>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              className="text-[#cfcfcf] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Member actions"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Member actions"
                            onAction={(key) => {
                              if (key === "kick") {
                                handleKickMember(member.id);
                              } else if (key === "replace") {
                                // TODO: Implement replace functionality
                                alert("Replace functionality coming soon");
                              }
                            }}
                          >
                            <DropdownItem key="replace">Replace Member</DropdownItem>
                            <DropdownItem key="kick" color="danger">
                              Remove from Squad
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Synergy & Strengths */}
            <div className="space-y-6">
              <SynergyHeatmap matrix={mockSquad.synergyMatrix} labels={memberLabels} />
              <TeamStrengths strengths={teamStrengths} />

              {/* Current Comp Display */}
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">Current Composition</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  {(["top", "jungle", "mid", "adc", "support"] as const).map((role) => {
                    const assignment = roleAssignments[role];
                    if (!assignment) return null;
                    return (
                      <div
                        key={role}
                        className="flex items-center justify-between p-2 bg-[#0d0d0d] rounded border border-[#2b2b2b]"
                      >
                        <div className="flex items-center gap-2">
                          <Chip size="sm" className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b]">
                            {role.toUpperCase()}
                          </Chip>
                          <span className="text-sm text-white">{assignment.player.username}</span>
                        </div>
                        {assignment.champion ? (
                          <Chip size="sm" className="bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/30">
                            {assignment.champion.name}
                          </Chip>
                        ) : (
                          <span className="text-xs text-[#cfcfcf]">No champ</span>
                        )}
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
            <CardBody className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Add at least 2 players to see synergy
                </h3>
                <p className="text-[#cfcfcf] mb-6">
                  Invite your friends to start building your squad and see team composition suggestions.
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Champion Selector Modal */}
        <ChampionSelector
          isOpen={championSelectorOpen}
          onClose={() => {
            setChampionSelectorOpen(false);
            setSelectedPlayerForChamp(null);
          }}
          onSelect={handleSelectChampion}
          currentRole={
            selectedPlayerForChamp
              ? (Object.entries(
                  squadMembers.find((m) => m.id === selectedPlayerForChamp)?.roleAffinity || {}
                ).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as "Top" | "Jungle" | "Mid" | "ADC" | "Support")
              : undefined
          }
          currentChampionId={
            selectedPlayerForChamp ? playerChampions[selectedPlayerForChamp]?.id : undefined
          }
        />
      </div>
    </PageShell>
  );
}
