"use client";

import { Chip } from "@heroui/chip";
import clsx from "clsx";

interface PlaystyleTagSelectorProps {
  game: "fortnite" | "valorant" | "apex" | "other";
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

const gameTags: Record<string, string[]> = {
  fortnite: ["Builder", "Aggressive", "Passive", "Support", "Fragger", "Sniper"],
  valorant: ["Duelist", "Controller", "Initiator", "Sentinel", "Aggressive", "Support"],
  apex: ["Fragger", "Entry", "Support", "IGL", "Lurker", "Anchor"],
  other: ["Aggressive", "Passive", "Support", "Fragger", "Utility"],
};

export function PlaystyleTagSelector({
  game,
  selected,
  onChange,
  className,
}: PlaystyleTagSelectorProps) {
  const tags = gameTags[game] || gameTags.other;

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className={clsx("flex flex-wrap gap-2", className)} role="group" aria-label={`${game} playstyle tags`}>
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <Chip
            key={tag}
            onClick={() => toggleTag(tag)}
            className={clsx(
              "cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d] rounded",
              isSelected
                ? "bg-[#ff7a00] text-white hover:bg-[#ff8a20] hover:shadow-[0_0_8px_rgba(255,122,0,0.4)]"
                : "bg-[#1a1a1a] text-[#cfcfcf] border border-[#2b2b2b] hover:border-[#ff7a00] hover:text-white"
            )}
            aria-pressed={isSelected}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTag(tag);
              }
            }}
          >
            {tag}
          </Chip>
        );
      })}
    </div>
  );
}

