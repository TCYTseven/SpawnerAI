"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSquadMembers, addSquadMember, removeSquadMember, getSynergy } from "@/lib/api";

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

export default function SquadPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<SquadMemberData[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [synergy, setSynergy] = useState<any>(null);
  const [squadData, setSquadData] = useState<{ [email: string]: any }>({});

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
        setMembers(data.members);
        
        if (data.members.length >= 2) {
          await loadSynergy(data.members);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load squad");
    } finally {
      setLoading(false);
    }
  };

  const loadSynergy = async (squadMembers: SquadMemberData[]) => {
    try {
      const emails = squadMembers.map((m) => m.email);
      const { data, error: synergyError } = await getSynergy(emails);

      if (synergyError) {
        console.error("Error loading synergy:", synergyError);
        return;
      }

      if (data) {
        setSynergy(data.synergy_output);
        setSquadData(data.squad_data);
      }
    } catch (err) {
      console.error("Error loading synergy:", err);
    }
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

    if (members.length >= 5) {
      setAddError("Squad is full (maximum 5 players)");
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
      const newMember: SquadMemberData = {
        email: memberData.email,
        riot_name: memberData.riot_name,
        riot_id: memberData.riot_id,
        is_self: false,
      };

      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);

      if (updatedMembers.length >= 2) {
        await loadSynergy(updatedMembers);
      }
    }

    setNewMemberEmail("");
    setAddingMember(false);
  };

  const handleRemoveMember = async (email: string) => {
    setRemovingEmail(email);
    const { error: removeErr } = await removeSquadMember(email);

    if (removeErr) {
      console.error("Error removing member:", removeErr);
      setRemovingEmail(null);
      return;
    }

    const updatedMembers = members.filter((m) => m.email !== email);
    setMembers(updatedMembers);

    if (updatedMembers.length >= 2) {
      await loadSynergy(updatedMembers);
    } else {
      setSynergy(null);
      setSquadData({});
    }

    setRemovingEmail(null);
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

  const formatSkillName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <PageShell
      title="Squad"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Squad" }]}
      navItems={navItems}
    >
      <div className="space-y-6 max-w-6xl">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {members.length < 2 ? (
          <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
            <CardBody className="p-8 text-center">
              <p className="text-xl text-[#cfcfcf] mb-4">Build Your Squad!</p>
              <p className="text-[#cfcfcf] mb-6">Add at least one teammate to unlock squad synergy analysis and role recommendations.</p>
              <div className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    label="Teammate Email"
                    placeholder="teammate@example.com"
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
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm mt-3">
                    {addError}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Synergy Overview */}
            {synergy && (
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">Squad Synergy</h2>
                    <p className="text-[#cfcfcf]">Team composition analysis and role recommendations</p>
                  </div>
                </CardHeader>
                <CardBody className="space-y-6 p-6">
                  {/* Overall Score and Rationale */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between">
                          <span className="text-[#cfcfcf]">Overall Synergy Score</span>
                          <span className="text-white font-semibold text-2xl">{synergy.overall_synergy_score}/100</span>
                        </div>
                        <Progress
                          value={synergy.overall_synergy_score}
                          className="max-w-full"
                          classNames={{
                            indicator: "bg-[#ff7a00]",
                            track: "bg-[#1a1a1a]",
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#cfcfcf] uppercase tracking-wide">Confidence</p>
                        <p className="text-lg font-bold text-[#00ff88]">{synergy.confidence}%</p>
                      </div>
                    </div>

                    {/* Rationale */}
                    {synergy.rationale && synergy.rationale.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-white uppercase">Rationale</h3>
                        <div className="space-y-2">
                          {synergy.rationale.map((point: string, index: number) => (
                            <div key={index} className="bg-[#0d0d0d] p-3 rounded-lg border border-[#2b2b2b]">
                              <p className="text-sm text-[#cfcfcf]">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Squad Members Details */}
            <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardHeader>
                <h2 className="text-2xl font-bold text-white">Squad Members ({members.length})</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                {members.map((member) => {
                  const memberSynergy = synergy?.players?.[member.email];
                  const aiOutput = squadData?.[member.email];
                  const styleVector = aiOutput?.synergy_profile?.style_vector;

                  return (
                    <div key={member.email} className="p-6 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b] space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-semibold text-lg">{member.email}</p>
                            {member.is_self && (
                              <Chip
                                size="sm"
                                className="bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/30"
                              >
                                You
                              </Chip>
                            )}
                          </div>
                          
                          {memberSynergy && (
                            <div className="mt-3 space-y-2">
                              <div>
                                <p className="text-xs text-[#cfcfcf] uppercase tracking-wide mb-1">Suggested Role</p>
                                <p className="text-lg font-bold text-[#ff7a00]">{memberSynergy.role}</p>
                              </div>
                              {memberSynergy.reasoning && (
                                <p className="text-sm text-[#cfcfcf]">{memberSynergy.reasoning}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Style Vector */}
                        {styleVector && (
                          <div className="flex flex-col items-center">
                            <p className="text-xs text-[#cfcfcf] uppercase tracking-wide mb-3">Playstyle Profile</p>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              {Object.entries(styleVector).map(([key, value]) => (
                                <div key={key} className="bg-[#1a1a1a] p-3 rounded border border-[#2b2b2b]">
                                  <p className="text-xs text-[#cfcfcf]">{formatSkillName(key)}</p>
                                  <p className="text-sm font-semibold text-[#ff7a00]">{Math.round(value as number)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Remove Button */}
                        {!member.is_self && (
                          <Button
                            isIconOnly
                            className="bg-red-500/20 text-red-500 hover:bg-red-500/40 h-10 w-10"
                            onPress={() => handleRemoveMember(member.email)}
                            isLoading={removingEmail === member.email}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            {/* Add More Members */}
            {members.length < 5 && (
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Add Squad Member</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="text-sm text-[#cfcfcf]">
                    Add more teammates (up to {5 - members.length} more player{5 - members.length !== 1 ? 's' : ''})
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
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
