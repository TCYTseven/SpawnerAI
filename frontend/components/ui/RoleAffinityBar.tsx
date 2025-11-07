"use client";

import clsx from "clsx";

interface RoleAffinityBarProps {
  affinity: {
    Top: number;
    Jungle: number;
    Mid: number;
    ADC: number;
    Support: number;
  };
  className?: string;
}

const roles: Array<{ key: keyof RoleAffinityBarProps["affinity"]; label: string }> = [
  { key: "Top", label: "Top" },
  { key: "Jungle", label: "Jungle" },
  { key: "Mid", label: "Mid" },
  { key: "ADC", label: "ADC" },
  { key: "Support", label: "Support" },
];

export function RoleAffinityBar({ affinity, className }: RoleAffinityBarProps) {
  const total = Object.values(affinity).reduce((sum, val) => sum + val, 0);
  const normalized = total > 0 ? Object.entries(affinity).map(([key, val]) => ({
    key: key as keyof typeof affinity,
    value: Math.round((val / total) * 100),
  })) : roles.map((r) => ({ key: r.key, value: 0 }));

  return (
    <div className={clsx("space-y-3", className)} role="group" aria-label="Role affinity distribution">
      {roles.map((role) => {
        const percentage = normalized.find((n) => n.key === role.key)?.value || 0;
        return (
          <div key={role.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{role.label}</span>
              <span className="text-sm text-[#cfcfcf]">{percentage}%</span>
            </div>
            <div
              className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2b2b2b]"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${role.label} affinity: ${percentage}%`}
            >
              <div
                className="h-full bg-[#ff7a00] transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

