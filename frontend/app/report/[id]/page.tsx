"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSquadMembers, getSynergy, getMatchHistory } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Recommendations", href: "/recommendations", section: "Team" },
];

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [squadMembers, setSquadMembers] = useState<any[]>([]);
  const [synergyData, setSynergyData] = useState<any>(null);
  const [leagueProgression, setLeagueProgression] = useState<any[]>([]);
  const hasFetchedRef = useRef(false);

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/report/${reportId}` : `/report/${reportId}`;

  useEffect(() => {
    if (hasFetchedRef.current || !user) {
      if (!user) {
        setLoading(false);
      }
      return;
    }

    hasFetchedRef.current = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [squadResult, historyResult] = await Promise.all([
          getSquadMembers(),
          getMatchHistory(),
        ]);

        const { data: squadData, error: squadError } = squadResult;
        const { data: historyData, error: historyError } = historyResult;

        if (squadError) {
          setError(squadError.message || "Failed to load squad data");
          setLoading(false);
          return;
        }

        if (squadData && squadData.members && squadData.members.length > 0) {
          setSquadMembers(squadData.members);

          const playerEmails = squadData.members.map((m: any) => m.email);

          if (playerEmails.length >= 2) {
            const synergyResult = await getSynergy(playerEmails);
            const { data: synergy, error: synergyError } = synergyResult;

            if (!synergyError && synergy) {
              setSynergyData(synergy);
            }
          }
        }

        if (!historyError && historyData && historyData.league?.progression) {
          const now = new Date();
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

          const filteredProgression = historyData.league.progression
            .filter((month: any) => {
              const monthDate = new Date(month.month_key);
              return monthDate >= oneYearAgo;
            })
            .map((month: any) => ({
              month: month.month,
              offense: Math.round(month.affinity.offense || 0),
              tank: Math.round(month.affinity.tank || 0),
              support: Math.round(month.affinity.support || 0),
              scout: Math.round(month.affinity.scout || 0),
              hybrid: Math.round(month.affinity.hybrid || 0),
            }));

          setLeagueProgression(filteredProgression);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: string) => {
    const text = `Check out my League of Legends squad report! ${shareLink}`;
    const url = encodeURIComponent(shareLink);

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, "_blank");
        break;
      case "instagram":
        copyShareLink();
        alert("Link copied! Paste it in your Instagram story.");
        break;
      case "snapchat":
        copyShareLink();
        alert("Link copied! Share it on Snapchat.");
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: "My League Squad Report", text, url: shareLink });
        } else {
          copyShareLink();
        }
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg p-3 shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <PageShell
        title="Squad Report"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Report" }]}
        navItems={navItems}
      >
        <div className="flex items-center justify-center h-[400px]">
          <Spinner size="lg" color="warning" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Squad Report"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Report" }]}
        navItems={navItems}
      >
        <Card className="bg-[#1a1a1a] border-2 border-red-500/50 max-w-2xl mx-auto">
          <CardBody>
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              <p className="font-semibold mb-2">Error loading report</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardBody>
        </Card>
      </PageShell>
    );
  }

  const synerggyScore = synergyData?.synergy_output?.overall_synergy_score || 0;
  const teamName = synergyData?.synergy_output?.team_name || "Team Spawner";

  return (
    <PageShell
      title="Squad Report"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Report" }]}
      navItems={navItems}
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Main Recap Card */}
        <Card className="bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460] border-2 border-[#ff7a00]/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a00]/10 to-transparent opacity-50" />
          <CardBody className="p-8 md:p-12 relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-xs font-mono text-[#ff7a00] uppercase tracking-widest mb-2">
                SQUAD REPORT
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {teamName}
              </h1>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-[#ff7a00]">{synerggyScore}%</div>
                  <div className="text-xs text-[#cfcfcf] uppercase tracking-wide">Overall Synergy</div>
                </div>
              </div>
            </div>

            {/* Squad Members */}
            <div className="mb-8">
              <div className="text-lg font-bold text-[#cfcfcf] mb-4 uppercase tracking-wide">
                Squad Members
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {squadMembers.map((member, idx) => (
                  <div key={member.email} className="text-center">
                    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2b2b2b]">
                      <div className="relative mb-2">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#ff7a00] to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        {idx === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff7a00] rounded-full flex items-center justify-center text-white text-xs font-black border border-white">
                            ★
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-white truncate">
                        {member.email.split("@")[0]}
                      </div>
                      <div className="text-xs text-[#cfcfcf]">
                        {member.suggested_role || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synergy Rationale */}
            {synergyData?.synergy_output?.synergy_rationale && (
              <div className="mb-8 p-4 bg-[#0d0d0d]/50 rounded-lg border border-[#2b2b2b]">
                <h3 className="text-sm font-semibold text-[#ff7a00] mb-3">Synergy Analysis</h3>
                <p className="text-sm text-[#cfcfcf] leading-relaxed">
                  {synergyData.synergy_output.synergy_rationale}
                </p>
              </div>
            )}

            {/* League of Legends Skill Progression */}
            {leagueProgression.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-[#ff7a00] rounded-full" />
                  <h3 className="text-lg font-bold text-white">League of Legends Skill Progression</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={leagueProgression}>
                    <defs>
                      <linearGradient id="colorOffenseReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ff7a00" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTankReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSupportReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorScoutReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHybridReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                    <XAxis
                      dataKey="month"
                      stroke="#cfcfcf"
                      tick={{ fill: "#cfcfcf", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#cfcfcf" tick={{ fill: "#cfcfcf" }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#cfcfcf" }} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="offense"
                      stroke="#ff7a00"
                      fillOpacity={1}
                      fill="url(#colorOffenseReport)"
                      name="Offense"
                    />
                    <Area
                      type="monotone"
                      dataKey="tank"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorTankReport)"
                      name="Tank"
                    />
                    <Area
                      type="monotone"
                      dataKey="support"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorSupportReport)"
                      name="Support"
                    />
                    <Area
                      type="monotone"
                      dataKey="scout"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorScoutReport)"
                      name="Scout"
                    />
                    <Area
                      type="monotone"
                      dataKey="hybrid"
                      stroke="#ec4899"
                      fillOpacity={1}
                      fill="url(#colorHybridReport)"
                      name="Hybrid"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-[#2b2b2b]">
              <div>
                <div className="text-xs text-[#cfcfcf]">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="text-xs text-[#ff7a00]">@spawnerai</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#cfcfcf]">Join us on</div>
                <div className="text-xs font-semibold text-[#ff7a00]">spawner.ai</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Share Buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => handleShare("twitter")}
            className="flex flex-col items-center gap-2 group"
            aria-label="Share on Twitter"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </div>
            <span className="text-xs text-[#cfcfcf]">Twitter</span>
          </button>

          <button
            onClick={() => handleShare("instagram")}
            className="flex flex-col items-center gap-2 group"
            aria-label="Share on Instagram"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="text-xs text-[#cfcfcf]">Instagram</span>
          </button>

          <button
            onClick={() => handleShare("share")}
            className="flex flex-col items-center gap-2 group"
            aria-label="Share"
          >
            <div className="w-16 h-16 bg-[#1a1a1a] border-2 border-[#2b2b2b] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span className="text-xs text-[#cfcfcf]">Share</span>
          </button>
        </div>

        {/* Copy Link Button */}
        <div className="text-center">
          <Button
            variant="bordered"
            className="border-[#2b2b2b] text-[#cfcfcf] hover:border-[#ff7a00] hover:text-white"
            onPress={copyShareLink}
          >
            {copied ? "Link Copied!" : "Copy Report Link"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
