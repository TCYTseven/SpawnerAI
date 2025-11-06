"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  ComposedChart,
} from "recharts";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

// Mock data generators
const generateSkillProgression = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    offense: 45 + Math.random() * 15 + i * 2,
    tank: 50 + Math.random() * 20 + i * 1.5,
    support: 55 + Math.random() * 10 + i * 1.8,
    scout: 40 + Math.random() * 25 + i * 2.5,
    utility: 60 + Math.random() * 15 + i * 1.2,
  }));
};

const generateCrossGameComparison = () => {
  const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
  return weeks.map((week, i) => ({
    week,
    fortniteKD: 1.2 + Math.random() * 0.8 + i * 0.05,
    leagueKD: 1.5 + Math.random() * 0.6 + i * 0.03,
    valorantKD: 1.1 + Math.random() * 0.7 + i * 0.04,
  }));
};

const generateMatchData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    match: i + 1,
    kills: Math.floor(8 + Math.random() * 12),
    deaths: Math.floor(3 + Math.random() * 8),
    assists: Math.floor(5 + Math.random() * 15),
    damage: Math.floor(15000 + Math.random() * 20000),
    win: Math.random() > 0.4,
  }));
};

const generateCompetencyData = () => {
  return [
    { skill: "Offense", value: 78, max: 100 },
    { skill: "Tank", value: 65, max: 100 },
    { skill: "Support", value: 82, max: 100 },
    { skill: "Scout", value: 71, max: 100 },
    { skill: "Utility", value: 88, max: 100 },
  ];
};

const generateGameStats = () => {
  return {
    league: {
      matches: 247,
      wins: 142,
      losses: 105,
      winRate: 57.5,
      kda: 2.3,
      avgKills: 8.2,
      avgDeaths: 4.1,
      avgAssists: 9.3,
      rank: "Gold II",
    },
    fortnite: {
      matches: 189,
      wins: 67,
      losses: 122,
      winRate: 35.4,
      kd: 1.8,
      avgKills: 6.4,
      avgDeaths: 3.6,
      rank: "Champion",
    },
    valorant: {
      matches: 156,
      wins: 89,
      losses: 67,
      winRate: 57.1,
      kd: 1.4,
      avgKills: 18.2,
      avgDeaths: 13.0,
      rank: "Diamond 1",
    },
  };
};

const generateRecentMatches = () => {
  return [
    { game: "League", result: "Win", kda: "12/3/8", date: "2h ago", champion: "Jinx" },
    { game: "Valorant", result: "Loss", kda: "18/15/4", date: "5h ago", champion: "Jett" },
    { game: "Fortnite", result: "Win", kda: "7 Kills", date: "1d ago", champion: "Solo" },
    { game: "League", result: "Win", kda: "9/2/11", date: "1d ago", champion: "Lux" },
    { game: "Valorant", result: "Win", kda: "22/10/6", date: "2d ago", champion: "Raze" },
  ];
};

export default function DashboardPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const skillProgression = useMemo(() => generateSkillProgression(), []);
  const crossGameComparison = useMemo(() => generateCrossGameComparison(), []);
  const matchData = useMemo(() => generateMatchData(), []);
  const competencyData = useMemo(() => generateCompetencyData(), []);
  const gameStats = useMemo(() => generateGameStats(), []);
  const recentMatches = useMemo(() => generateRecentMatches(), []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    onOpen();
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = `Based on your performance data across League of Legends, Fortnite, and Valorant:

**Strengths:**
- Your Support and Utility skills are exceptional (82% and 88% respectively), showing strong team coordination and game sense
- Consistent improvement in Scout positioning over the past 6 months (+15% trend)
- Strong KDA ratios across all games, particularly in League (2.3 KDA)

**Areas for Improvement:**
- Offense positioning could be optimized - you're averaging 8.2 kills but dying 4.1 times per match
- Tank role shows variability - consider focusing on engagement timing
- Fortnite win rate (35.4%) is lower than other games - work on late-game positioning

**Recommendations:**
1. Focus on aggressive positioning in early game to capitalize on your high offense stat
2. Your utility skills suggest you'd excel in support roles - consider maining support champions
3. Cross-game analysis shows your League performance is strongest - leverage those mechanics in Valorant
4. Scout skills are improving rapidly - this could be your breakout role

**Predicted Performance:**
Based on current trends, you're on track to reach Diamond rank in League within 2-3 weeks if you maintain current improvement rate.`;
      
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
            <p className="text-[#cfcfcf]">Track your progress across all games</p>
          </div>
          <Button
            className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
            onPress={handleAIAnalysis}
            startContent={<span>🤖</span>}
          >
            AI Analyze Performance
          </Button>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#2b2b2b]">
            <CardBody className="p-6">
              <div className="text-sm text-[#cfcfcf] mb-1">Overall Win Rate</div>
              <div className="text-3xl font-bold text-white mb-2">52.3%</div>
              <div className="text-xs text-green-400">↑ 3.2% this month</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#2b2b2b]">
            <CardBody className="p-6">
              <div className="text-sm text-[#cfcfcf] mb-1">Total Matches</div>
              <div className="text-3xl font-bold text-white mb-2">592</div>
              <div className="text-xs text-[#cfcfcf]">Across 3 games</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#2b2b2b]">
            <CardBody className="p-6">
              <div className="text-sm text-[#cfcfcf] mb-1">Avg K/D Ratio</div>
              <div className="text-3xl font-bold text-white mb-2">1.8</div>
              <div className="text-xs text-green-400">↑ 0.3 this week</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#2b2b2b]">
            <CardBody className="p-6">
              <div className="text-sm text-[#cfcfcf] mb-1">Skill Rating</div>
              <div className="text-3xl font-bold text-white mb-2">76.8</div>
              <div className="text-xs text-green-400">↑ 4.2 this month</div>
            </CardBody>
          </Card>
        </div>

        {/* Competency Breakdown */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Competency Breakdown</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Skill Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={competencyData}>
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
                {competencyData.map((item) => (
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
          </CardBody>
        </Card>

        {/* Skill Progression Over Time */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Skill Progression (12 Months)</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={skillProgression}>
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
                  <linearGradient id="colorUtility" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                <XAxis
                  dataKey="month"
                  stroke="#cfcfcf"
                  tick={{ fill: "#cfcfcf" }}
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
                  dataKey="utility"
                  stroke="#ec4899"
                  fillOpacity={1}
                  fill="url(#colorUtility)"
                  name="Utility"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Cross-Game Comparison */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Cross-Game K/D Comparison</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={crossGameComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                <XAxis
                  dataKey="week"
                  stroke="#cfcfcf"
                  tick={{ fill: "#cfcfcf", fontSize: 11 }}
                />
                <YAxis
                  stroke="#cfcfcf"
                  tick={{ fill: "#cfcfcf" }}
                  label={{ value: "K/D Ratio", angle: -90, position: "insideLeft", fill: "#cfcfcf" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2b2b2b",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#cfcfcf" }}
                />
                <Legend
                  wrapperStyle={{ color: "#cfcfcf" }}
                  iconType="circle"
                />
                <Bar dataKey="fortniteKD" fill="#3b82f6" name="Fortnite" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leagueKD" fill="#ff7a00" name="League" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="valorantKD"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Valorant"
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Game Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(gameStats).map(([game, stats]) => (
            <Card key={game} className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-xl font-bold text-white capitalize">{game}</h3>
                  <Chip className="bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/30">
                    {stats.rank}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#cfcfcf]">Matches</div>
                    <div className="text-2xl font-bold text-white">{stats.matches}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#cfcfcf]">Win Rate</div>
                    <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#cfcfcf]">K/D</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.kd || stats.kda}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#cfcfcf]">Avg Kills</div>
                    <div className="text-2xl font-bold text-white">{stats.avgKills}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#2b2b2b]">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Wins: {stats.wins}</span>
                    <span className="text-red-400">Losses: {stats.losses}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Recent Match Performance */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Recent Match Performance</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matchData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                <XAxis
                  dataKey="match"
                  stroke="#cfcfcf"
                  tick={{ fill: "#cfcfcf" }}
                />
                <YAxis stroke="#cfcfcf" tick={{ fill: "#cfcfcf" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2b2b2b",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ color: "#cfcfcf" }} />
                <Bar dataKey="kills" fill="#10b981" name="Kills" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deaths" fill="#ef4444" name="Deaths" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assists" fill="#3b82f6" name="Assists" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Recent Matches List */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#ff7a00] rounded-full" />
              <h2 className="text-2xl font-bold text-white">Recent Matches</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentMatches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b] hover:border-[#ff7a00]/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Chip
                      className={
                        match.result === "Win"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }
                    >
                      {match.result}
                    </Chip>
                    <div>
                      <div className="text-white font-semibold">{match.game}</div>
                      <div className="text-sm text-[#cfcfcf]">{match.champion}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{match.kda}</div>
                    <div className="text-sm text-[#cfcfcf]">{match.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
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
