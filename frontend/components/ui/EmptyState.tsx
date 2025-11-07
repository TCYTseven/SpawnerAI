"use client";

import { Button } from "@heroui/button";
import clsx from "clsx";

interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#cfcfcf] mb-6 max-w-md">{description}</p>
      <div className="flex gap-3">
        {primaryAction && (
          <Button
            className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
            onPress={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="bordered"
            className="border-[#2b2b2b] text-[#cfcfcf] hover:border-[#ff7a00] hover:text-white"
            onPress={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

