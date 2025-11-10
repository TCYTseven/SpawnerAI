"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Tabs, Tab } from "@heroui/tabs";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { getAffinity, getMatchHistory } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

// Helper function to convert playstyle affinities to competency data
const affinityToCompetencyData = (affinity: any) => {
  return [
    { skill: "Offense", value: Math.round(affinity.offense || 0), max: 100 },
    { skill: "Tank", value: Math.round(affinity.tank || 0), max: 100 },
    { skill: "Support", value: Math.round(affinity.support || 0), max: 100 },
    { skill: "Scout", value: Math.round(affinity.scout || 0), max: 100 },
    { skill: "Hybrid", value: Math.round(affinity.hybrid || 0), max: 100 },
  ];
};


export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedTab, setSelectedTab] = useState<"league" | "dota2" | "apex" | "csgo" | "fortnite" | "valorant">("league");
  const [dota2CompetencyData, setDota2CompetencyData] = useState([
    { skill: "Offense", value: 0, max: 100 },
    { skill: "Tank", value: 0, max: 100 },
    { skill: "Support", value: 0, max: 100 },
    { skill: "Scout", value: 0, max: 100 },
    { skill: "Hybrid", value: 0, max: 100 },
  ]);
  const [leagueCompetencyData, setLeagueCompetencyData] = useState([
    { skill: "Offense", value: 0, max: 100 },
    { skill: "Tank", value: 0, max: 100 },
    { skill: "Support", value: 0, max: 100 },
    { skill: "Scout", value: 0, max: 100 },
    { skill: "Hybrid", value: 0, max: 100 },
  ]);
  const [dota2SkillProgression, setDota2SkillProgression] = useState<any[]>([]);
  const [leagueSkillProgression, setLeagueSkillProgression] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Fetch real data from backend - ONLY ONCE on mount
  useEffect(() => {
    // Prevent multiple calls
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
        // Fetch both affinity and match history in parallel
        const [affinityResult, historyResult] = await Promise.all([
          getAffinity(),
          getMatchHistory(),
        ]);
        
        const { data: affinityData, error: affinityError } = affinityResult;
        const { data: historyData, error: historyError } = historyResult;
        
        if (affinityError) {
          setError(affinityError.message || "Failed to load data");
        } else if (affinityData) {
          // Update Dota 2 competency data
          if (affinityData.dota2?.affinity) {
            setDota2CompetencyData(affinityToCompetencyData(affinityData.dota2.affinity));
          }
          
          // Update League competency data
          if (affinityData.league?.affinity) {
            setLeagueCompetencyData(affinityToCompetencyData(affinityData.league.affinity));
          }
        }

        if (historyError) {
          console.error("Error fetching match history:", historyError);
          // Don't set this as a fatal error - match history is optional
          // The user can still see affinity data even without match history
        } else if (historyData) {
          // Transform Dota 2 progression data
          if (historyData.dota2?.progression) {
            const progressionChartData = historyData.dota2.progression.map((month) => ({
              month: month.month,
              offense: Math.round(month.affinity.offense || 0),
              tank: Math.round(month.affinity.tank || 0),
              support: Math.round(month.affinity.support || 0),
              scout: Math.round(month.affinity.scout || 0),
              hybrid: Math.round(month.affinity.hybrid || 0),
            }));
            setDota2SkillProgression(progressionChartData);
          }
          
          // Transform League progression data
          if (historyData.league?.progression) {
            const progressionChartData = historyData.league.progression.map((month) => ({
              month: month.month,
              offense: Math.round(month.affinity.offense || 0),
              tank: Math.round(month.affinity.tank || 0),
              support: Math.round(month.affinity.support || 0),
              scout: Math.round(month.affinity.scout || 0),
              hybrid: Math.round(month.affinity.hybrid || 0),
            }));
            setLeagueSkillProgression(progressionChartData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);


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

  return (
    <PageShell
      title="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white mb-2">
            Performance <span className="text-[#ff7a00]">Analytics</span>
          </h1>
          <p className="text-[#cfcfcf]">Track your gaming performance and skill progression across all titles</p>
        </div>

        {error && (
          <Card className="bg-[#1a1a1a] border-2 border-red-500/50">
            <CardBody>
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                <p className="font-semibold mb-2">Error loading dashboard data</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Game Tabs */}
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as "league" | "dota2" | "apex" | "csgo" | "fortnite" | "valorant")}
          classNames={{
            tabList: "bg-[#1a1a1a] border-2 border-[#2b2b2b] rounded-lg p-1",
            tab: "data-[selected=true]:bg-[#ff7a00] data-[selected=true]:text-white",
            tabContent: "text-[#cfcfcf]",
          }}
        >
          <Tab key="league" title="League of Legends">
            <div className="space-y-6 mt-6">
              {/* Competency Breakdown */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">League of Legends Competency Breakdown</h2>
            </div>
          </CardHeader>
          <CardBody>
                  {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Spinner size="lg" color="warning" />
                    </div>
                  ) : !leagueCompetencyData.some(s => s.value > 0) ? (
                    <div className="flex items-center justify-center h-[300px] text-[#cfcfcf]">
                      <p>No League of Legends data available. Link your Riot ID in your profile to see your stats!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Radar Chart */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Skill Radar</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={leagueCompetencyData}>
                            <PolarGrid stroke="#2b2b2b" />
                            <PolarAngleAxis
                              dataKey="skill"
                              tick={{ fill: "#cfcfcf", fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{ fill: "#cfcfcf", fontSize: 10 }}
                            />
                            <Radar
                              name="Competency"
                              dataKey="value"
                              stroke="#ff7a00"
                              fill="#ff7a00"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
            </ResponsiveContainer>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h3>
                        {leagueCompetencyData.map((item) => (
                          <div key={item.skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{item.skill}</span>
                              <span className="text-[#ff7a00] font-bold">{item.value}%</span>
                </div>
                            <Progress
                              value={item.value}
                              className="w-full"
                              classNames={{
                                indicator: "bg-gradient-to-r from-[#ff7a00] to-orange-600",
                                track: "bg-[#0d0d0d]",
                              }}
                            />
                  </div>
                        ))}
                  </div>
                    </div>
                  )}
              </CardBody>
            </Card>

              {/* Skill Progression Over Time */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">League of Legends Skill Progression Over Time</h2>
            </div>
          </CardHeader>
          <CardBody>
                  {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <Spinner size="lg" color="warning" />
                    </div>
                  ) : leagueSkillProgression.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-[#cfcfcf]">
                      <p>No League of Legends match history data available. Play some matches to see your progression!</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={leagueSkillProgression}>
                        <defs>
                          <linearGradient id="colorOffenseLeague" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ff7a00" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorTankLeague" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSupportLeague" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorScoutLeague" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorHybridLeague" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis
                  stroke="#cfcfcf"
                  tick={{ fill: "#cfcfcf" }}
                          domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ color: "#cfcfcf" }}
                          iconType="circle"
                        />
                        <Area
                          type="monotone"
                          dataKey="offense"
                          stroke="#ff7a00"
                          fillOpacity={1}
                          fill="url(#colorOffenseLeague)"
                          name="Offense"
                        />
                        <Area
                          type="monotone"
                          dataKey="tank"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorTankLeague)"
                          name="Tank"
                        />
                        <Area
                          type="monotone"
                          dataKey="support"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorSupportLeague)"
                          name="Support"
                        />
                        <Area
                          type="monotone"
                          dataKey="scout"
                          stroke="#8b5cf6"
                          fillOpacity={1}
                          fill="url(#colorScoutLeague)"
                          name="Scout"
                        />
                        <Area
                          type="monotone"
                          dataKey="hybrid"
                          stroke="#ec4899"
                          fillOpacity={1}
                          fill="url(#colorHybridLeague)"
                          name="Hybrid"
                        />
                      </AreaChart>
            </ResponsiveContainer>
                  )}
          </CardBody>
        </Card>
            </div>
          </Tab>

          <Tab key="dota2" title="Dota 2">
            <div className="space-y-6 mt-6">
              {/* Competency Breakdown */}
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Dota 2 Competency Breakdown</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Spinner size="lg" color="warning" />
                    </div>
                  ) : !dota2CompetencyData.some(s => s.value > 0) ? (
                    <div className="flex items-center justify-center h-[300px] text-[#cfcfcf]">
                      <p>No Dota 2 data available. Link your Steam ID in your profile to see your stats!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Radar Chart */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Skill Radar</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={dota2CompetencyData}>
                            <PolarGrid stroke="#2b2b2b" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: "#cfcfcf", fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#cfcfcf", fontSize: 10 }} />
                            <Radar name="Competency" dataKey="value" stroke="#ff7a00" fill="#ff7a00" fillOpacity={0.6} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Progress Bars */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h3>
                        {dota2CompetencyData.map((item) => (
                          <div key={item.skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{item.skill}</span>
                              <span className="text-[#ff7a00] font-bold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="w-full" classNames={{ indicator: "bg-gradient-to-r from-[#ff7a00] to-orange-600", track: "bg-[#0d0d0d]" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Skill Progression Over Time */}
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Dota 2 Skill Progression Over Time</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <Spinner size="lg" color="warning" />
                    </div>
                  ) : dota2SkillProgression.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-[#cfcfcf]">
                      <p>No Dota 2 match history data available. Play some matches to see your progression!</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={dota2SkillProgression}>
                        <defs>
                          <linearGradient id="colorOffenseDota" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ff7a00" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorTankDota" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSupportDota" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorScoutDota" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorHybridDota" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                        <XAxis dataKey="month" stroke="#cfcfcf" tick={{ fill: "#cfcfcf", fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#cfcfcf" tick={{ fill: "#cfcfcf" }} domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: "#cfcfcf" }} iconType="circle" />
                        <Area type="monotone" dataKey="offense" stroke="#ff7a00" fillOpacity={1} fill="url(#colorOffenseDota)" name="Offense" />
                        <Area type="monotone" dataKey="tank" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTankDota)" name="Tank" />
                        <Area type="monotone" dataKey="support" stroke="#10b981" fillOpacity={1} fill="url(#colorSupportDota)" name="Support" />
                        <Area type="monotone" dataKey="scout" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScoutDota)" name="Scout" />
                        <Area type="monotone" dataKey="hybrid" stroke="#ec4899" fillOpacity={1} fill="url(#colorHybridDota)" name="Hybrid" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="apex" title="Apex Legends">
            <div className="space-y-6 mt-6">
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Apex Legends Stats</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Skill Breakdown</h3>
                      <div className="space-y-4">
                        {[
                          { skill: "Aim Precision", value: 85 },
                          { skill: "Legend Mastery", value: 78 },
                          { skill: "Team Communication", value: 82 },
                          { skill: "Positioning", value: 80 },
                          { skill: "Clutch Performance", value: 75 },
                        ].map((item) => (
                          <div key={item.skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{item.skill}</span>
                              <span className="text-[#ff7a00] font-bold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="w-full" classNames={{ indicator: "bg-gradient-to-r from-[#ff7a00] to-orange-600", track: "bg-[#0d0d0d]" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2b2b2b] space-y-4">
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Total Kills</p>
                        <p className="text-3xl font-bold text-white">1,247</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">K/D Ratio</p>
                        <p className="text-3xl font-bold text-[#ff7a00]">2.3</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Win Rate</p>
                        <p className="text-3xl font-bold text-white">18.5%</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="csgo" title="CS:GO">
            <div className="space-y-6 mt-6">
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">CS:GO Stats</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                      <div className="space-y-4">
                        {[
                          { skill: "Aim Accuracy", value: 89 },
                          { skill: "Map Knowledge", value: 84 },
                          { skill: "Recoil Control", value: 87 },
                          { skill: "Game Sense", value: 81 },
                          { skill: "Spray Control", value: 85 },
                        ].map((item) => (
                          <div key={item.skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{item.skill}</span>
                              <span className="text-[#ff7a00] font-bold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="w-full" classNames={{ indicator: "bg-gradient-to-r from-[#ff7a00] to-orange-600", track: "bg-[#0d0d0d]" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2b2b2b] space-y-4">
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Rank</p>
                        <p className="text-3xl font-bold text-white">Global Elite</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Win Rate</p>
                        <p className="text-3xl font-bold text-[#ff7a00]">62.4%</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Average Rating</p>
                        <p className="text-3xl font-bold text-white">1.28</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="fortnite" title="Fortnite">
            <div className="space-y-6 mt-6">
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Fortnite Stats</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Playstyle Analysis</h3>
                      <div className="space-y-4">
                        {[
                          { skill: "Building Speed", value: 91 },
                          { skill: "Combat Awareness", value: 86 },
                          { skill: "Editing Precision", value: 88 },
                          { skill: "Rotation Management", value: 79 },
                          { skill: "Loadout Optimization", value: 83 },
                        ].map((item) => (
                          <div key={item.skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{item.skill}</span>
                              <span className="text-[#ff7a00] font-bold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="w-full" classNames={{ indicator: "bg-gradient-to-r from-[#ff7a00] to-orange-600", track: "bg-[#0d0d0d]" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2b2b2b] space-y-4">
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Wins (Solo)</p>
                        <p className="text-3xl font-bold text-white">342</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Win Rate</p>
                        <p className="text-3xl font-bold text-[#ff7a00]">14.2%</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">K/D Ratio</p>
                        <p className="text-3xl font-bold text-white">2.1</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="valorant" title="Valorant">
            <div className="space-y-6 mt-6">
              <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Valorant Stats</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Agent Performance</h3>
                      <div className="space-y-4">
                        {[
                          { skill: "Aim Consistency", value: 87 },
                          { skill: "Ability Usage", value: 85 },
                          { skill: "Map Control", value: 83 },
                          { skill: "Economy Management", value: 80 },
                          { skill: "Team Coordination", value: 88 },
                        ].map((item) => (
                          <div key={item.skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{item.skill}</span>
                              <span className="text-[#ff7a00] font-bold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="w-full" classNames={{ indicator: "bg-gradient-to-r from-[#ff7a00] to-orange-600", track: "bg-[#0d0d0d]" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#2b2b2b] space-y-4">
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Current Rank</p>
                        <p className="text-3xl font-bold text-white">Radiant</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Win Rate</p>
                        <p className="text-3xl font-bold text-[#ff7a00]">58.6%</p>
                      </div>
                      <div>
                        <p className="text-[#cfcfcf] text-sm">Combat Score/Round</p>
                        <p className="text-3xl font-bold text-white">234</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>

      </div>

    </PageShell>
  );
}
