"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { mockChampions, getChampionsForRole } from "@/types/mock";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Recommendations", href: "/recommendations", section: "Team" },
];

// Mock user data - in real app this would come from onboarding/storage
const mockUserData = {
  games: {
    fortnite: { username: "FortnitePlayer", skillType: "Fragger" },
    valorant: { username: "ValorantPlayer#1234", skillType: "Duelist" },
    apex: { username: "ApexPlayer", skillType: "Fragger" },
  },
  behaviors: {
    aggression: 75,
    positioning: 60,
    utility: 40,
    clutch: 80,
    awareness: 70,
  },
};

// Generate match scores for champions based on user data
function calculateChampionMatch(champion: typeof mockChampions[0], userData: typeof mockUserData): number {
  let matchScore = 50; // Base score

  // Adjust based on user's aggression
  if (champion.tags.includes("Engage") && userData.behaviors.aggression > 70) {
    matchScore += 20;
  }
  if (champion.tags.includes("Scaling") && userData.behaviors.aggression < 50) {
    matchScore += 15;
  }
  if (champion.tags.includes("Peel") && userData.behaviors.utility > 60) {
    matchScore += 15;
  }

  // Adjust based on game playstyle
  if (userData.games.valorant.skillType === "Duelist" && champion.tags.includes("Engage")) {
    matchScore += 10;
  }
  if (userData.games.fortnite.skillType === "Fragger" && champion.tags.includes("Carry")) {
    matchScore += 10;
  }

  return Math.min(100, Math.max(0, matchScore));
}

// Get personalized recommendations
function getRecommendations(userData: typeof mockUserData) {
  const recommendations = [];

  // Based on Valorant Duelist playstyle
  if (userData.games.valorant.skillType === "Duelist") {
    const champs = getChampionsForRole("Mid", 3);
    recommendations.push({
      title: "Based on your Valorant Duelist playstyle",
      description: "You're aggressive and like to make plays. These mid lane champions match that energy.",
      champions: champs.map((champ) => ({
        ...champ,
        matchScore: calculateChampionMatch(champ, userData),
      })),
    });
  }

  // Based on high aggression
  if (userData.behaviors.aggression > 70) {
    const champs = getChampionsForRole("Top", 2);
    recommendations.push({
      title: "Based on your aggressive playstyle",
      description: "You like to engage and take fights. These top laners fit that style.",
      champions: champs.map((champ) => ({
        ...champ,
        matchScore: calculateChampionMatch(champ, userData),
      })),
    });
  }

  // Based on high clutch factor
  if (userData.behaviors.clutch > 75) {
    const champs = getChampionsForRole("ADC", 2);
    recommendations.push({
      title: "Based on your clutch factor",
      description: "You perform well under pressure. These ADCs can carry late game.",
      champions: champs.map((champ) => ({
        ...champ,
        matchScore: calculateChampionMatch(champ, userData),
      })),
    });
  }

  return recommendations;
}

export default function ChampionsPage() {
  const recommendations = getRecommendations(mockUserData);
  
  // Get all champions with match scores
  const allChampions = mockChampions.map((champ) => ({
    ...champ,
    matchScore: calculateChampionMatch(champ, mockUserData),
  })).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <PageShell
      title="Champions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Champions" }]}
      navItems={navItems}
    >
      <div className="space-y-8">
        {/* Personalized Recommendations */}
        {recommendations.map((rec, index) => (
          <Card key={index} className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
            <CardHeader>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{rec.title}</h2>
                <p className="text-[#cfcfcf]">{rec.description}</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rec.champions.map((champ) => (
                  <Card key={champ.id} className="bg-[#0d0d0d] border border-[#2b2b2b]">
                    <CardBody className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{champ.name}</h3>
                        <span className="text-sm font-semibold text-[#ff7a00]">{champ.matchScore}%</span>
                      </div>
                      <p className="text-sm text-[#cfcfcf]">{champ.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {champ.tags.map((tag) => (
                          <Chip
                            key={tag}
                            size="sm"
                            className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b] text-xs"
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                      <Progress
                        value={champ.matchScore}
                        className="max-w-full"
                        classNames={{
                          indicator: "bg-[#ff7a00]",
                          track: "bg-[#1a1a1a]",
                        }}
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}

        {/* All Champions Table */}
        <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white">All Champions</h2>
            <p className="text-[#cfcfcf]">See how each champion matches your playstyle</p>
          </CardHeader>
          <CardBody>
            <Table
              aria-label="Champions match table"
              classNames={{
                wrapper: "bg-[#0d0d0d]",
                th: "bg-[#1a1a1a] text-[#cfcfcf] border-b border-[#2b2b2b]",
                td: "border-b border-[#2b2b2b]",
              }}
            >
              <TableHeader>
                <TableColumn>CHAMPION</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>TAGS</TableColumn>
                <TableColumn>% MATCH</TableColumn>
                <TableColumn>MATCH BAR</TableColumn>
              </TableHeader>
              <TableBody>
                {allChampions.map((champion) => (
                  <TableRow key={champion.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a1a1a] rounded border border-[#2b2b2b] flex items-center justify-center">
                          <span className="text-xl">🎮</span>
                        </div>
                        <span className="font-semibold text-white">{champion.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b]"
                      >
                        {champion.role}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {champion.tags.map((tag) => (
                          <Chip
                            key={tag}
                            size="sm"
                            className="bg-[#0d0d0d] text-[#cfcfcf] border border-[#2b2b2b] text-xs"
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          champion.matchScore >= 70
                            ? "text-[#ff7a00]"
                            : champion.matchScore >= 50
                              ? "text-yellow-500"
                              : "text-[#cfcfcf]"
                        }`}
                      >
                        {champion.matchScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress
                          value={champion.matchScore}
                          className="max-w-full"
                          classNames={{
                            indicator:
                              champion.matchScore >= 70
                                ? "bg-[#ff7a00]"
                                : champion.matchScore >= 50
                                  ? "bg-yellow-500"
                                  : "bg-[#cfcfcf]",
                            track: "bg-[#1a1a1a]",
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}

