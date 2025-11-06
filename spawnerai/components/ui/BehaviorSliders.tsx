"use client";

import { Progress } from "@heroui/progress";
import clsx from "clsx";

interface Behavior {
  label: string;
  key: keyof {
    aggression: number;
    positioning: number;
    utility: number;
    clutch: number;
    awareness: number;
  };
  description?: string;
}

interface BehaviorSlidersProps {
  behaviors: {
    aggression: number;
    positioning: number;
    utility: number;
    clutch: number;
    awareness: number;
  };
  onChange: (key: string, value: number) => void;
  className?: string;
}

const behaviorConfig: Behavior[] = [
  { label: "Aggression", key: "aggression", description: "How aggressively you engage" },
  { label: "Positioning", key: "positioning", description: "Your positioning awareness" },
  { label: "Utility/Support", key: "utility", description: "How much you focus on utility" },
  { label: "Clutch", key: "clutch", description: "Your clutch factor" },
  { label: "Awareness", key: "awareness", description: "Map and game awareness" },
];

export function BehaviorSliders({
  behaviors,
  onChange,
  className,
}: BehaviorSlidersProps) {
  return (
    <div className={clsx("space-y-6", className)}>
      {behaviorConfig.map((behavior) => {
        const value = behaviors[behavior.key];
        return (
          <div key={behavior.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor={behavior.key}
                className="text-sm font-medium text-white"
              >
                {behavior.label}
              </label>
              <span className="text-sm text-[#ff7a00] font-semibold">{value}</span>
            </div>
            {behavior.description && (
              <p className="text-xs text-[#cfcfcf]">{behavior.description}</p>
            )}
            <div className="relative">
              <input
                id={behavior.key}
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(behavior.key, parseInt(e.target.value))}
                className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#ff7a00] focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:ring-offset-2 focus:ring-offset-[#0d0d0d]"
                style={{
                  background: `linear-gradient(to right, #ff7a00 0%, #ff7a00 ${value}%, #1a1a1a ${value}%, #1a1a1a 100%)`,
                }}
                aria-label={behavior.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

