"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import clsx from "clsx";

interface MapPlayer {
  id: string;
  username: string;
  role: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
  champion?: {
    id: string;
    name: string;
  };
  position: { x: number; y: number }; // Percentage positions on map
}

interface LeagueMapProps {
  players: MapPlayer[];
  onPlayerClick?: (playerId: string) => void;
  className?: string;
}

export function LeagueMap({ players, onPlayerClick, className }: LeagueMapProps) {
  // Map positions for each role (approximate positions on Summoner's Rift)
  const rolePositions: Record<string, { x: number; y: number }> = {
    Top: { x: 20, y: 15 },
    Jungle: { x: 50, y: 50 },
    Mid: { x: 50, y: 50 },
    ADC: { x: 20, y: 85 },
    Support: { x: 35, y: 85 },
  };

  return (
    <Card className={clsx("bg-[#1a1a1a] border-2 border-[#2b2b2b]", className)}>
      <CardBody className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Squad Formation</h3>
        <div className="relative aspect-square bg-gradient-to-br from-[#0a4d2e] via-[#0d5d3a] to-[#0a4d2e] rounded-lg border-2 border-[#1a5d3a] overflow-hidden">
          {/* Map grid lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#2b2b2b]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#2b2b2b]" />
          </div>

          {/* Lane labels */}
          <div className="absolute top-2 left-2 text-xs font-bold text-white/80 uppercase tracking-wide">
            Top Lane
          </div>
          <div className="absolute top-2 right-2 text-xs font-bold text-white/80 uppercase tracking-wide">
            Jungle
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white/80 uppercase tracking-wide bg-[#0d0d0d]/50 px-2 py-1 rounded">
            Mid Lane
          </div>
          <div className="absolute bottom-2 left-2 text-xs font-bold text-white/80 uppercase tracking-wide">
            ADC
          </div>
          <div className="absolute bottom-2 right-2 text-xs font-bold text-white/80 uppercase tracking-wide">
            Support
          </div>

          {/* Player markers */}
          {players.map((player) => {
            const pos = player.position || rolePositions[player.role] || { x: 50, y: 50 };
            return (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => onPlayerClick?.(player.id)}
              >
                <div className="relative">
                  <Avatar
                    name={player.username}
                    className="w-12 h-12 bg-gradient-to-br from-[#ff7a00] to-orange-600 text-white font-bold border-2 border-white shadow-lg group-hover:scale-110 transition-transform"
                  />
                  {player.champion && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0d0d0d] rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs">🎮</span>
                    </div>
                  )}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#0d0d0d] px-2 py-1 rounded border border-[#2b2b2b] shadow-lg">
                      <div className="text-xs font-semibold text-white">{player.username}</div>
                      <Chip
                        size="sm"
                        className="bg-[#ff7a00] text-white text-xs mt-1"
                      >
                        {player.role}
                      </Chip>
                      {player.champion && (
                        <div className="text-xs text-[#ff7a00] mt-1 font-medium">
                          {player.champion.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {player.champion && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-[#0d0d0d] px-2 py-1 rounded border border-[#ff7a00]/50 shadow-lg">
                        <div className="text-xs font-semibold text-[#ff7a00]">{player.champion.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

