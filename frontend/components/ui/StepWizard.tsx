"use client";

import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import clsx from "clsx";

interface Step {
  key: string;
  title: string;
  description?: string;
}

interface StepWizardProps {
  steps: Step[];
  current: number;
  onNext: () => void;
  onBack: () => void;
  onFinish?: () => void;
  canProceed?: boolean;
  children: React.ReactNode;
}

export function StepWizard({
  steps,
  current,
  onNext,
  onBack,
  onFinish,
  canProceed = true,
  children,
}: StepWizardProps) {
  const progress = ((current + 1) / steps.length) * 100;
  const isLastStep = current === steps.length - 1;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#cfcfcf]">
            Step {current + 1} of {steps.length}
          </span>
          <span className="text-sm text-[#cfcfcf]">{Math.round(progress)}%</span>
        </div>
        <Progress
          value={progress}
          className="max-w-full"
          classNames={{
            indicator: "bg-[#ff7a00]",
            track: "bg-[#1a1a1a]",
          }}
          aria-label={`Progress: ${Math.round(progress)}%`}
        />
      </div>

      {/* Step Info */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">{steps[current].title}</h2>
        {steps[current].description && (
          <p className="text-[#cfcfcf]">{steps[current].description}</p>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[#2b2b2b]">
        <Button
          variant="light"
          className="text-[#cfcfcf] hover:text-white"
          onPress={onBack}
          isDisabled={current === 0}
          aria-label="Go to previous step"
        >
          Back
        </Button>
        <Button
          className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
          onPress={isLastStep ? onFinish : onNext}
          isDisabled={!canProceed}
          aria-label={isLastStep ? "Finish onboarding" : "Go to next step"}
        >
          {isLastStep ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

