"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Tabs, Tab } from "@heroui/tabs";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
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
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [selectedTab, setSelectedTab] = useState<"dota2" | "league">("dota2");
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


  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    onOpen();
    
    // Generate AI analysis based on selected game's competency data
    const competencyData = selectedTab === "dota2" ? dota2CompetencyData : leagueCompetencyData;
    const skillProgression = selectedTab === "dota2" ? dota2SkillProgression : leagueSkillProgression;
    const gameName = selectedTab === "dota2" ? "Dota 2" : "League of Legends";
    
    setTimeout(() => {
      const bestSkill = competencyData.reduce((a, b) => (a.value > b.value ? a : b));
      const worstSkill = competencyData.reduce((a, b) => (a.value < b.value ? a : b));
      
      const analysis = `Based on your ${gameName} match history analysis:

**Strengths:**
- Your ${bestSkill.skill} skills are your strongest (${bestSkill.value}%), showing excellent performance in this area
${skillProgression.length > 0 ? `- Skill progression shows ${skillProgression.length} months of match data analyzed` : ''}
- Match history analysis indicates consistent playstyle patterns

**Areas for Improvement:**
- ${worstSkill.skill} skills (${worstSkill.value}%) could be developed further
- Consider focusing on improving your weakest areas through targeted practice

**Recommendations:**
1. Focus on ${bestSkill.skill} - your strongest skill suggests this is your natural playstyle
2. Work on improving ${worstSkill.skill} to become a more well-rounded player
3. Review your match history trends to identify patterns in your gameplay
4. Continue playing to build more match data for better predictions

**Skill Breakdown:**
${competencyData.map(skill => `- ${skill.skill}: ${skill.value}%`).join('\n')}`;
      
      setAiAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000);
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

  return (
    <PageShell
      title="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header with AI Analysis Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              Performance <span className="text-[#ff7a00]">Analytics</span>
            </h1>
            <p className="text-[#cfcfcf]">Track your Dota 2 performance and skill progression</p>
          </div>
          <Button
            className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
            onPress={handleAIAnalysis}
            startContent={<span>🤖</span>}
          >
            AI Analyze Performance
          </Button>
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
          onSelectionChange={(key) => setSelectedTab(key as "dota2" | "league")}
          classNames={{
            tabList: "bg-[#1a1a1a] border-2 border-[#2b2b2b] rounded-lg p-1",
            tab: "data-[selected=true]:bg-[#ff7a00] data-[selected=true]:text-white",
            tabContent: "text-[#cfcfcf]",
          }}
        >
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
                        {dota2CompetencyData.map((item) => (
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
                  <linearGradient id="colorOffense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff7a00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSupport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorScout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                          <linearGradient id="colorHybrid" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorOffense)"
                  name="Offense"
                />
                <Area
                  type="monotone"
                  dataKey="tank"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorTank)"
                  name="Tank"
                />
                <Area
                  type="monotone"
                  dataKey="support"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorSupport)"
                  name="Support"
                />
                <Area
                  type="monotone"
                  dataKey="scout"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorScout)"
                  name="Scout"
                />
                <Area
                  type="monotone"
                          dataKey="hybrid"
                  stroke="#ec4899"
                  fillOpacity={1}
                          fill="url(#colorHybrid)"
                          name="Hybrid"
                />
              </AreaChart>
            </ResponsiveContainer>
                  )}
          </CardBody>
        </Card>
            </div>
          </Tab>
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
        </Tabs>

      </div>

      {/* AI Analysis Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        classNames={{
          base: "bg-[#1a1a1a] border-2 border-[#2b2b2b]",
          header: "border-b border-[#2b2b2b]",
          body: "py-6",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h2 className="text-2xl font-bold text-white">AI Performance Analysis</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" color="warning" />
                <p className="text-[#cfcfcf] mt-4">Analyzing your performance data...</p>
              </div>
            ) : (
              <div className="text-[#cfcfcf] whitespace-pre-line leading-relaxed">
                {aiAnalysis}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
              onPress={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageShell>
  );
}
