// Simple localStorage utilities for mock state

const ONBOARDING_KEY = "spawner_onboarding_completed";

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setOnboardingCompleted(completed: boolean = true): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, String(completed));
}

