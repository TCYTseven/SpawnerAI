"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAIOutput } from "@/lib/api";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Recommendations", href: "/recommendations", section: "Team" },
];

interface AIOutput {
  primary_role: string;
  secondary_role: string;
  synergy_profile: {
    style_vector: {
      aggression: number;
      positioning: number;
      teamplay: number;
      utility: number;
      clutch: number;
    };
    derived_from: string[];
  };
  champion_shortlist: Array<{
    name: string;
    why: string;
    difficulty: string;
  }>;
  next_actions: string[];
  rationale: string[];
  confidence: number;
  skills_dashboard: {
    offense: number;
    tank: number;
    support: number;
    scout: number;
    hybrid: number;
  };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: apiError } = await getAIOutput();
        if (apiError) {
          setError(apiError.message);
        } else if (data?.ai_output) {
          setAiOutput(data.ai_output);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) {
    return (
      <PageShell
        title="Recommendations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]}
        navItems={navItems}
      >
        <div className="flex items-center justify-center h-96">
          <p className="text-[#cfcfcf]">Loading your recommendations...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !aiOutput) {
    return (
      <PageShell
        title="Recommendations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]}
        navItems={navItems}
      >
        <div className="flex items-center justify-center h-96">
          <Card className="bg-[#1a1a1a] border-2 border-[#ff4655] max-w-md">
            <CardBody className="p-6">
              <p className="text-[#ff4655]">
                {error || "No recommendations found. Please complete onboarding first."}
              </p>
            </CardBody>
          </Card>
        </div>
      </PageShell>
    );
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      Top: "#ff4655",
      Jungle: "#d32ce6",
      Mid: "#ff7a00",
      ADC: "#00d4ff",
      Support: "#00ff88",
    };
    return colors[role] || "#cfcfcf";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low":
        return "bg-green-500/20 text-green-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "High":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-[#1a1a1a] text-[#cfcfcf]";
    }
  };

  const formatSkillName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <PageShell
      title="Recommendations"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recommendations" }]}
      navItems={navItems}
    >
      <div className="space-y-8">
        {/* Primary Role Section */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Your Recommended Role</h2>
              <p className="text-[#cfcfcf]">Primary and secondary roles that match your playstyle</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Role */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#cfcfcf]">PRIMARY ROLE</p>
                <div
                  className="p-6 rounded-lg border-2 flex items-center justify-center"
                  style={{
                    borderColor: getRoleColor(aiOutput.primary_role),
                    backgroundColor: getRoleColor(aiOutput.primary_role) + "15",
                  }}
                >
                  <span
                    className="text-3xl font-bold"
                    style={{ color: getRoleColor(aiOutput.primary_role) }}
                  >
                    {aiOutput.primary_role}
                  </span>
                </div>
              </div>

              {/* Secondary Role */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#cfcfcf]">SECONDARY ROLE</p>
                <div
                  className="p-6 rounded-lg border-2 flex items-center justify-center"
                  style={{
                    borderColor: getRoleColor(aiOutput.secondary_role),
                    backgroundColor: getRoleColor(aiOutput.secondary_role) + "15",
                  }}
                >
                  <span
                    className="text-3xl font-bold"
                    style={{ color: getRoleColor(aiOutput.secondary_role) }}
                  >
                    {aiOutput.secondary_role}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Synergy Profile Section */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Synergy Profile</h2>
              <p className="text-[#cfcfcf]">Your playstyle traits and how they influence your gameplay</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            {/* Style Vector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Style Vector</h3>
              {Object.entries(aiOutput.synergy_profile.style_vector).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#cfcfcf]">{formatSkillName(key)}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                  <Progress
                    value={value}
                    className="max-w-full"
                    classNames={{
                      indicator: "bg-[#ff7a00]",
                      track: "bg-[#1a1a1a]",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Derived From */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Derived From</h3>
              <div className="flex flex-wrap gap-2">
                {aiOutput.synergy_profile.derived_from.map((game) => (
                  <Chip
                    key={game}
                    className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b]"
                  >
                    {formatSkillName(game)}
                  </Chip>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recommended Champions Section */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Recommended Champions</h2>
              <p className="text-[#cfcfcf]">Champions that fit your playstyle and skill level</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiOutput.champion_shortlist.map((champion, index) => (
                <Card key={index} className="bg-[#0d0d0d] border border-[#2b2b2b]">
                  <CardBody className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white">{champion.name}</h3>
                    <p className="text-sm text-[#cfcfcf]">{champion.why}</p>
                    <div className="flex items-center justify-between pt-2">
                      <Chip
                        className={`border border-[#2b2b2b] ${getDifficultyColor(
                          champion.difficulty
                        )}`}
                        size="sm"
                      >
                        {champion.difficulty}
                      </Chip>
                      <span className="text-xs text-[#cfcfcf]">Difficulty</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Next Actions & Rationale Section */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Next Actions & Rationale</h2>
              <p className="text-[#cfcfcf]">Steps to maximize your gameplay</p>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            {/* Next Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Next Actions</h3>
              <ul className="space-y-2">
                {aiOutput.next_actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ff7a00] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-[#0d0d0d]">{index + 1}</span>
                    </div>
                    <span className="text-[#cfcfcf]">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rationale */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Rationale</h3>
              <div className="space-y-2">
                {aiOutput.rationale.map((point, index) => (
                  <div key={index} className="bg-[#0d0d0d] p-3 rounded-lg border border-[#2b2b2b]">
                    <p className="text-[#cfcfcf]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2 pt-4 border-t border-[#2b2b2b]">
              <div className="flex justify-between">
                <span className="text-[#cfcfcf]">Recommendation Confidence</span>
                <span className="text-white font-semibold">{aiOutput.confidence}%</span>
              </div>
              <Progress
                value={aiOutput.confidence}
                className="max-w-full"
                classNames={{
                  indicator: "bg-[#00d4ff]",
                  track: "bg-[#1a1a1a]",
                }}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
