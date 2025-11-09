"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSquadMembers, addSquadMember, getSuggestedRole, getAffinity } from "@/lib/api";
import { AffinityRadar } from "@/components/ui/AffinityRadar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
];

interface SquadMemberData {
  email: string;
  riot_name?: string;
  riot_id?: string;
  is_self: boolean;
  suggested_role?: string;
  affinity?: {
    offense: number;
    tank: number;
    support: number;
    scout: number;
    hybrid: number;
  };
}

export default function SquadPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<SquadMemberData[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSquad();
    }
  }, []);

  const loadSquad = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await getSquadMembers();

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (data && data.members) {
        const membersWithData = await Promise.all(
          data.members.map(async (member) => {
            if (member.is_self && member.riot_name && member.riot_id) {
              const { data: affData } = await getAffinity();
              if (affData?.league?.affinity) {
                return {
                  ...member,
                  affinity: affData.league.affinity,
                  suggested_role: getSuggestedRoleFromAffinity(affData.league.affinity),
                };
              }
            } else if (!member.is_self && member.riot_name && member.riot_id) {
              const { data: roleData } = await getSuggestedRole(member.email);
              if (roleData) {
                return {
                  ...member,
                  suggested_role: roleData.suggested_role,
                  affinity: roleData.affinity,
                };
              }
            }
            return member;
          })
        );

        setMembers(membersWithData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load squad");
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedRoleFromAffinity = (affinity: any): string => {
    if (!affinity) return "Unknown";
    const mapping: Record<string, string> = {
      tank: "Top",
      scout: "Jungle",
      offense: "Mid",
      hybrid: "ADC",
      support: "Support",
    };
    const entries = Object.entries(affinity) as Array<[string, number]>;
    const bestKey = entries.reduce((a, b) =>
      (b[1] as number) > (a[1] as number) ? b : a
    )[0];
    return mapping[bestKey] || "Unknown";
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      setAddError("Please enter an email address");
      return;
    }

    if (newMemberEmail === user?.email) {
      setAddError("Cannot add yourself");
      return;
    }

    setAddingMember(true);
    setAddError(null);

    const { data: memberData, error: addErr } = await addSquadMember(newMemberEmail);

    if (addErr) {
      setAddError(addErr.message);
      setAddingMember(false);
      return;
    }

    if (memberData) {
      let newMember: SquadMemberData = {
        email: memberData.email,
        riot_name: memberData.riot_name,
        riot_id: memberData.riot_id,
        is_self: false,
      };

      if (memberData.riot_name && memberData.riot_id) {
        const { data: roleData } = await getSuggestedRole(memberData.email);
        if (roleData) {
          newMember = {
            ...newMember,
            suggested_role: roleData.suggested_role,
            affinity: roleData.affinity,
          };
        }
      }

      setMembers([...members, newMember]);
    }

    setNewMemberEmail("");
    setAddingMember(false);
  };

  if (loading) {
    return (
      <PageShell
        title="Squad"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Squad" }]}
        navItems={navItems}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#cfcfcf]">Loading squad...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Squad"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Squad" }]}
      navItems={navItems}
    >
      <div className="space-y-6 max-w-5xl">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Squad Members List */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white">Squad Members</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {members.map((member, index) => (
              <div key={index} className="flex gap-6 p-4 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b]">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg">{member.email}</p>
                      {member.is_self && (
                        <Chip
                          size="sm"
                          className="bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/30 mt-2"
                        >
                          You
                        </Chip>
                      )}
                    </div>
                    {member.suggested_role && (
                      <div className="text-right">
                        <p className="text-xs text-[#cfcfcf] uppercase tracking-wide">Suggested Role</p>
                        <p className="text-lg font-bold text-[#ff7a00]">{member.suggested_role}</p>
                      </div>
                    )}
                  </div>
                </div>

                {member.affinity ? (
                  <div className="w-40">
                    <AffinityRadar affinity={member.affinity} size={140} />
                  </div>
                ) : (
                  <div className="w-40 flex items-center justify-center">
                    <p className="text-center text-sm text-[#cfcfcf]">
                      {member.riot_name ? "No match data" : "Not linked to League"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Add Member */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Add Squad Member</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-[#cfcfcf]">
              Enter the email address of a player to add them to your squad.
            </p>
            <div className="flex gap-3">
              <Input
                type="email"
                label="Player Email"
                placeholder="player@example.com"
                value={newMemberEmail}
                onValueChange={setNewMemberEmail}
                className="flex-1"
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
              />
              <Button
                color="warning"
                className="bg-[#ff7a00] text-white font-semibold"
                onPress={handleAddMember}
                isLoading={addingMember}
              >
                Add
              </Button>
            </div>

            {addError && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                {addError}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
