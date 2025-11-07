"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import clsx from "clsx";

interface TeamStrengthsProps {
  strengths: {
    engage: number;
    peel: number;
    pick: number;
    scaling: number;
  };
  className?: string;
}

export function TeamStrengths({ strengths, className }: TeamStrengthsProps) {
  const getStrengthLabel = (value: number) => {
    if (value >= 70) return { label: "Strong", color: "text-green-400" };
    if (value >= 50) return { label: "Moderate", color: "text-yellow-400" };
    return { label: "Weak", color: "text-red-400" };
  };

  return (
    <Card className={clsx("bg-[#1a1a1a] border-2 border-[#2b2b2b]", className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Team Strengths & Weaknesses</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(strengths).map(([key, value]) => {
            const strength = getStrengthLabel(value);
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white capitalize">{key}</span>
                  <span className={clsx("text-sm font-semibold", strength.color)}>
                    {strength.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#0d0d0d] rounded-full overflow-hidden border border-[#2b2b2b]">
                    <div
                      className={clsx(
                        "h-full transition-all",
                        value >= 70
                          ? "bg-green-500"
                          : value >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#cfcfcf] w-10 text-right">{value}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

