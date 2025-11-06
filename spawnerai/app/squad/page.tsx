"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { InviteBlock } from "@/components/ui/InviteBlock";
import { SynergyHeatmap } from "@/components/ui/SynergyHeatmap";
import { CompSuggestionCard } from "@/components/ui/CompSuggestionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockSquad, mockPlayers } from "@/types/mock";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

export default function SquadPage() {
  const hasMembers = mockSquad.members.length >= 2;
  const memberLabels = mockSquad.members.map((m) => m.username);

  return (
    <PageShell
      title="Squad"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Squad" }]}
      actions={
        <Button
          className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
          onPress={async () => {
            const link = typeof window !== "undefined" ? `${window.location.origin}/squad?invite=SPAWN-ABC123` : `/squad?invite=SPAWN-ABC123`;
            try {
              await navigator.clipboard.writeText(link);
            } catch (err) {
              console.error("Failed to copy:", err);
            }
          }}
        >
          Copy Squad Link
        </Button>
      }
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Invite Block */}
        <InviteBlock />

        {hasMembers ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Members */}
            <div className="space-y-4">
              <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Squad Members</h2>
                </CardHeader>
                <CardBody className="space-y-3">
                  {mockSquad.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b]"
                    >
                      <Avatar
                        name={member.username}
                        className="bg-[#ff7a00] text-white"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{member.username}</span>
                          {member.preferredRole && (
                            <Chip
                              size="sm"
                              className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b]"
                            >
                              {member.preferredRole}
                            </Chip>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.values(member.playstyleTags)
                            .flat()
                            .slice(0, 3)
                            .map((tag, i) => (
                              <Chip
                                key={i}
                                size="sm"
                                className="bg-[#0d0d0d] text-[#cfcfcf] border border-[#2b2b2b] text-xs"
                              >
                                {tag}
                              </Chip>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Synergy & Comps */}
            <div className="space-y-4">
              <SynergyHeatmap matrix={mockSquad.synergyMatrix} labels={memberLabels} />
              {mockSquad.compSuggestions.map((comp) => (
                <CompSuggestionCard key={comp.id} suggestion={comp} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Add at least 2 players to see synergy"
            description="Invite your friends to start building your squad and see team composition suggestions."
            primaryAction={{
              label: "Invite Members",
              onClick: () => {
                // Scroll to invite block
                document.getElementById("invite-block")?.scrollIntoView({ behavior: "smooth" });
              },
            }}
          />
        )}
      </div>
    </PageShell>
  );
}

