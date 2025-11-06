"use client";

import { Card, CardBody } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import clsx from "clsx";
import { useState } from "react";

interface SynergyHeatmapProps {
  matrix: number[][];
  labels: string[];
  className?: string;
}

export function SynergyHeatmap({ matrix, labels, className }: SynergyHeatmapProps) {
  const [tableMode, setTableMode] = useState(false);

  const getColor = (value: number) => {
    if (value >= 80) return "bg-[#ff7a00]";
    if (value >= 60) return "bg-[#ff8a20]";
    if (value >= 40) return "bg-[#ff9a40]";
    if (value >= 20) return "bg-[#ffaa60]";
    return "bg-[#1a1a1a]";
  };

  if (tableMode) {
    return (
      <Card className={clsx("bg-[#1a1a1a] border border-[#2b2b2b]", className)}>
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Synergy Matrix</h3>
            <Switch
              isSelected={tableMode}
              onValueChange={setTableMode}
              aria-label="Toggle table mode"
            >
              Table Mode
            </Switch>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Synergy matrix">
              <thead>
                <tr>
                  <th className="text-left text-[#cfcfcf] p-2 border-b border-[#2b2b2b]"></th>
                  {labels.map((label) => (
                    <th
                      key={label}
                      className="text-left text-[#cfcfcf] p-2 border-b border-[#2b2b2b]"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="text-[#cfcfcf] p-2 border-b border-[#2b2b2b] font-medium">
                      {labels[i]}
                    </td>
                    {row.map((value, j) => (
                      <td
                        key={j}
                        className={clsx(
                          "p-2 border-b border-[#2b2b2b] text-white text-center",
                          getColor(value)
                        )}
                        aria-label={`Synergy between ${labels[i]} and ${labels[j]}: ${value}%`}
                      >
                        {value}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={clsx("bg-[#1a1a1a] border border-[#2b2b2b]", className)}>
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Synergy Heatmap</h3>
          <Switch
            isSelected={tableMode}
            onValueChange={setTableMode}
            aria-label="Toggle table mode"
          >
            Table Mode
          </Switch>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${labels.length + 1}, minmax(0, 1fr))` }}>
          {/* Header row */}
          <div className="p-2"></div>
          {labels.map((label) => (
            <div key={label} className="p-2 text-xs text-[#cfcfcf] font-medium text-center">
              {label}
            </div>
          ))}

          {/* Data rows */}
          {matrix.map((row, i) => (
            <>
              <div key={`label-${i}`} className="p-2 text-xs text-[#cfcfcf] font-medium">
                {labels[i]}
              </div>
              {row.map((value, j) => (
                <Tooltip
                  key={`${i}-${j}`}
                  content={`${labels[i]} ↔ ${labels[j]}: ${value}%`}
                  className="bg-[#0d0d0d] text-white border border-[#2b2b2b]"
                >
                  <div
                    className={clsx(
                      "aspect-square flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:ring-2 hover:ring-[#ff7a00] transition-all",
                      getColor(value),
                      i === j && "opacity-50"
                    )}
                    role="gridcell"
                    aria-label={`Synergy between ${labels[i]} and ${labels[j]}: ${value}%`}
                    tabIndex={0}
                  >
                    {value}
                  </div>
                </Tooltip>
              ))}
            </>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

