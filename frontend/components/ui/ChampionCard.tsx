"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import clsx from "clsx";

interface ChampionCardProps {
  champion: {
    id: string;
    name: string;
    role: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
    tags: string[];
    fitScore: number;
    portrait?: string;
  };
  className?: string;
}

export function ChampionCard({ champion, className }: ChampionCardProps) {
  return (
    <Card
      className={clsx(
        "bg-[#1a1a1a] border border-[#2b2b2b] hover:border-[#ff7a00] transition-all hover:shadow-[0_0_12px_rgba(255,122,0,0.2)]",
        className
      )}
    >
      <CardBody className="p-4 space-y-3">
        {/* Portrait placeholder */}
        <div className="w-full aspect-[3/4] bg-[#0d0d0d] rounded-lg flex items-center justify-center border border-[#2b2b2b]">
          <div className="text-center">
            <div className="text-4xl mb-2">🎮</div>
            <div className="text-xs text-[#cfcfcf]">{champion.name}</div>
          </div>
        </div>

        {/* Name and Role */}
        <div>
          <h3 className="text-lg font-semibold text-white">{champion.name}</h3>
          <p className="text-sm text-[#cfcfcf]">{champion.role}</p>
        </div>

        {/* Tags */}
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

        {/* Fit Score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#cfcfcf]">Fit Score</span>
            <span className="text-xs font-semibold text-[#ff7a00]">{champion.fitScore}%</span>
          </div>
          <Progress
            value={champion.fitScore}
            className="max-w-full"
            classNames={{
              indicator: "bg-[#ff7a00]",
              track: "bg-[#0d0d0d]",
            }}
            aria-label={`Fit score: ${champion.fitScore}%`}
          />
        </div>
      </CardBody>
    </Card>
  );
}

