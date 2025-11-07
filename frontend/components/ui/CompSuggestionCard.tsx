"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import clsx from "clsx";

interface CompSuggestionCardProps {
  suggestion: {
    id: string;
    top: { name: string; role: string };
    jungle: { name: string; role: string };
    mid: { name: string; role: string };
    adc: { name: string; role: string };
    support: { name: string; role: string };
    rationale: string[];
    teamMeters: {
      engage: number;
      peel: number;
      pick: number;
      scaling: number;
    };
  };
  className?: string;
}

export function CompSuggestionCard({ suggestion, className }: CompSuggestionCardProps) {
  const roles = [
    { key: "top", label: "Top", champ: suggestion.top },
    { key: "jungle", label: "Jungle", champ: suggestion.jungle },
    { key: "mid", label: "Mid", champ: suggestion.mid },
    { key: "adc", label: "ADC", champ: suggestion.adc },
    { key: "support", label: "Support", champ: suggestion.support },
  ];

  return (
    <Card className={clsx("bg-[#1a1a1a] border border-[#2b2b2b]", className)}>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-white">Team Composition</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Champions */}
        <div className="grid grid-cols-5 gap-2">
          {roles.map((role) => (
            <div key={role.key} className="text-center">
              <div className="w-full aspect-square bg-[#0d0d0d] rounded-lg flex flex-col items-center justify-center border border-[#2b2b2b] mb-1">
                <div className="text-2xl">🎮</div>
              </div>
              <p className="text-xs text-white font-medium">{role.champ.name}</p>
              <p className="text-xs text-[#cfcfcf]">{role.label}</p>
            </div>
          ))}
        </div>

        {/* Rationale */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Why this comp?</h4>
          <ul className="space-y-1">
            {suggestion.rationale.map((point, i) => (
              <li key={i} className="text-sm text-[#cfcfcf] flex items-start gap-2">
                <span className="text-[#ff7a00] mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Meters */}
        <div className="space-y-2 pt-2 border-t border-[#2b2b2b]">
          <h4 className="text-sm font-semibold text-white">Team Strengths</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(suggestion.teamMeters).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#cfcfcf] capitalize">{key}</span>
                  <span className="text-xs text-[#ff7a00] font-semibold">{value}%</span>
                </div>
                <div
                  className="h-2 bg-[#0d0d0d] rounded-full overflow-hidden border border-[#2b2b2b]"
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
            ))}
          </div>
        </div>

        {/* Swap Suggestions */}
        <div className="pt-2 border-t border-[#2b2b2b]">
          <p className="text-xs text-[#cfcfcf] mb-2">Swap suggestions:</p>
          <div className="flex flex-wrap gap-1">
            <Chip size="sm" className="bg-[#0d0d0d] text-[#cfcfcf] border border-[#2b2b2b] text-xs">
              Try peel support (+18)
            </Chip>
            <Chip size="sm" className="bg-[#0d0d0d] text-[#cfcfcf] border border-[#2b2b2b] text-xs">
              More engage (+12)
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

