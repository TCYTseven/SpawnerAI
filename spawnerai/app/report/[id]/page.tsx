"use client";

import { TopNav } from "@/components/navigation/TopNav";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { ChampionCard } from "@/components/ui/ChampionCard";
import { siteConfig } from "@/config/site";
import { mockSquad, mockPlayers, getChampionsForRole } from "@/types/mock";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [copied, setCopied] = useState(false);

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/report/${reportId}` : `/report/${reportId}`;

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] text-white">
      <TopNav links={siteConfig.navItems} />
      <div className="container mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            {mockSquad.name} Report
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff7a00]">
                {mockSquad.synergyScore}%
              </div>
              <div className="text-sm text-[#cfcfcf]">Synergy Score</div>
            </div>
          </div>
          <Button
            className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
            onPress={copyShareLink}
          >
            {copied ? "Copied!" : "Share Report"}
          </Button>
        </div>

        {/* Role Assignments */}
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b] mb-6">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">Role Assignments</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {mockPlayers.map((player) => {
              const topAffinity = player.roleAffinity.Top;
              const bestRole = Object.entries(player.roleAffinity).reduce((a, b) =>
                a[1] > b[1] ? a : b
              )[0] as keyof typeof player.roleAffinity;
              const confidence = player.roleAffinity[bestRole];

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-4 bg-[#0d0d0d] rounded-lg border border-[#2b2b2b]"
                >
                  <Avatar name={player.username} className="bg-[#ff7a00] text-white" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{player.username}</span>
                      <Chip
                        size="sm"
                        className="bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b]"
                      >
                        {bestRole}
                      </Chip>
                      <span className="text-sm text-[#ff7a00] font-semibold">
                        {confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-[#cfcfcf]">
                      Based on your playstyle, {bestRole} is your best fit.
                    </p>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Champion Recommendations */}
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b] mb-6">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">
              Champion Recommendations
            </h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {mockPlayers.map((player) => {
              const bestRole = Object.entries(player.roleAffinity).reduce((a, b) =>
                a[1] > b[1] ? a : b
              )[0] as "Top" | "Jungle" | "Mid" | "ADC" | "Support";
              const champs = getChampionsForRole(bestRole, 5);

              return (
                <div key={player.id}>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {player.username} - {bestRole}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {champs.map((champ) => (
                      <ChampionCard key={champ.id} champion={champ} />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Team Meters */}
        {mockSquad.compSuggestions.length > 0 && (
          <Card className="bg-[#1a1a1a] border border-[#2b2b2b] mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-white">Team Strengths</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(mockSquad.compSuggestions[0].teamMeters).map(
                  ([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white capitalize">
                          {key}
                        </span>
                        <span className="text-sm text-[#ff7a00] font-semibold">{value}%</span>
                      </div>
                      <div
                        className="h-3 bg-[#0d0d0d] rounded-full overflow-hidden border border-[#2b2b2b]"
                        role="progressbar"
                        aria-valuenow={value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${key}: ${value}%`}
                      >
                        <div
                          className="h-full bg-[#ff7a00] transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-xl text-white mb-4">Your League starter kit is live.</p>
          <Button
            as="a"
            href="/dashboard"
            className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

