"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { mockSquad, mockPlayers, getChampionsForRole, mockChampions } from "@/types/mock";
import { useParams } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
];

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

  const handleShare = (platform: string) => {
    const text = `Check out my League of Legends squad report! ${shareLink}`;
    const url = encodeURIComponent(shareLink);
    
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, "_blank");
        break;
      case "instagram":
        // Instagram doesn't support direct sharing, so copy link
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

  // Get top champions for each player
  const topChampions = mockPlayers.map((player) => {
    const bestRole = Object.entries(player.roleAffinity).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as "Top" | "Jungle" | "Mid" | "ADC" | "Support";
    const champs = getChampionsForRole(bestRole, 3);
    return { player, role: bestRole, champions: champs };
  });

  return (
    <PageShell
      title="Squad Report"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Report" }]}
      navItems={navItems}
    >
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        {/* Main Recap Card */}
        <Card className="bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460] border-2 border-[#ff7a00]/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a00]/10 to-transparent opacity-50" />
          <CardBody className="p-8 md:p-12 relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-xs font-mono text-[#ff7a00] uppercase tracking-widest mb-2">
                YOUR SQUAD REPORT
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {mockSquad.name}
              </h1>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-[#ff7a00]">{mockSquad.synergyScore}%</div>
                  <div className="text-xs text-[#cfcfcf] uppercase tracking-wide">Synergy</div>
                </div>
              </div>
            </div>

            {/* Top Players */}
            <div className="mb-8">
              <div className="text-lg font-bold text-[#cfcfcf] mb-4 uppercase tracking-wide">
                top players
              </div>
              <div className="flex items-center justify-center gap-4">
                {mockPlayers.slice(0, 3).map((player, index) => (
                  <div key={player.id} className="text-center">
                    <div className="relative mb-2">
                      <Avatar
                        name={player.username}
                        className="w-16 h-16 bg-gradient-to-br from-[#ff7a00] to-orange-600 text-white font-black text-lg border-4 border-white shadow-lg"
                      />
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#ff7a00] rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white">
                        {index + 1}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">{player.username}</div>
                    <div className="text-xs text-[#cfcfcf]">
                      {Object.entries(player.roleAffinity).reduce((a, b) => (a[1] > b[1] ? a : b))[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Played Champions */}
            <div className="mb-8">
              <div className="text-lg font-bold text-[#cfcfcf] mb-4 uppercase tracking-wide">
                most played
              </div>
              <div className="grid grid-cols-3 gap-4">
                {topChampions[0]?.champions.slice(0, 3).map((champ, index) => (
                  <div key={champ.id} className="text-center">
                    <div className="aspect-square bg-[#0d0d0d] rounded-lg border-2 border-[#ff7a00]/30 flex items-center justify-center mb-2">
                      <div className="text-3xl">🎮</div>
                    </div>
                    <div className="text-xs text-white font-semibold">{champ.name}</div>
                    <div className="text-xs text-[#cfcfcf]">{champ.role}</div>
                    <div className="text-xs text-[#ff7a00] font-semibold mt-1">
                      {Math.floor(Math.random() * 50) + 20} games
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0d0d0d]/50 rounded-lg p-4 text-center border border-[#2b2b2b]">
                <div className="text-2xl font-black text-white">{mockSquad.members.length}</div>
                <div className="text-xs text-[#cfcfcf] uppercase tracking-wide mt-1">Squad Size</div>
              </div>
              <div className="bg-[#0d0d0d]/50 rounded-lg p-4 text-center border border-[#2b2b2b]">
                <div className="text-2xl font-black text-white">
                  {mockSquad.compSuggestions.length}
                </div>
                <div className="text-xs text-[#cfcfcf] uppercase tracking-wide mt-1">Comps</div>
              </div>
              <div className="bg-[#0d0d0d]/50 rounded-lg p-4 text-center border border-[#2b2b2b]">
                <div className="text-2xl font-black text-white">
                  {mockChampions.length}
                </div>
                <div className="text-xs text-[#cfcfcf] uppercase tracking-wide mt-1">Champions</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-[#2b2b2b]">
              <div>
                <div className="text-xs text-[#cfcfcf]">January 2025</div>
                <div className="text-xs text-[#ff7a00]">@spawnerai</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#cfcfcf]">Join me on</div>
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
            onClick={() => handleShare("snapchat")}
            className="flex flex-col items-center gap-2 group"
            aria-label="Share on Snapchat"
          >
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.206.793c.99 1.002 2.402 2.562 3.91 4.601 4.932 6.33 10.613 15.805 6.264 20.15-.998 1.002-2.332 1.644-3.666 1.644-1.552 0-3.472-.834-5.508-2.61-1.12-1.01-2.128-2.01-2.619-2.405a.186.186 0 0 0-.225 0c-.491.395-1.499 1.395-2.619 2.405-2.036 1.776-3.956 2.61-5.508 2.61-1.334 0-2.668-.642-3.666-1.644C-.7 21.1 4.98 11.625 9.912 5.294c1.508-2.039 2.92-3.599 3.91-4.6z" />
              </svg>
            </div>
            <span className="text-xs text-[#cfcfcf]">Snapchat</span>
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
