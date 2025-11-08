"use client";

import { PageShell } from "@/components/layout/PageShell";
import { StepWizard } from "@/components/ui/StepWizard";
import { Input } from "@heroui/input";
import { Typewriter } from "@/components/ui/Typewriter";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { saveUserProfile } from "@/lib/userProfile";
import { useAuth } from "@/contexts/AuthContext";
import { getAffinity } from "@/lib/api";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
];

const steps = [
  {
    key: "games",
    title: "Link Games",
    description: "Connect your gaming profiles",
  },
  {
    key: "fetching",
    title: "Analyzing",
    description: "Fetching your stats",
  },
  {
    key: "explain",
    title: "Learn the Basics",
    description: "Understanding League terms",
  },
];

const leagueTerms = [
  {
    term: "Top Lane",
    explanation:
      "The top lane is the solo lane at the top of the map. Top laners are usually tanky fighters who can hold their own in 1v1 situations. Think of them as the frontline warriors who can take damage and deal it back.",
  },
  {
    term: "Jungle",
    explanation:
      "The jungler roams between lanes, farming neutral monsters and helping teammates. They're like the support player who can appear anywhere to turn fights. If you like being strategic and helping your team, this might be for you.",
  },
  {
    term: "Mid Lane",
    explanation:
      "The mid lane is the center of the map, giving quick access to everywhere. Mid laners are usually mages or assassins who deal lots of damage. If you like being the carry and making big plays, mid is your lane.",
  },
  {
    term: "ADC (Attack Damage Carry)",
    explanation:
      "The ADC stays in the bottom lane with a support. They're weak early but become incredibly powerful late game. If you like being the main damage dealer and scaling into a monster, ADC is your role.",
  },
  {
    term: "Support",
    explanation:
      "Supports help their ADC in the bottom lane. They provide utility, healing, and protection. If you like helping teammates succeed and setting up plays, support is perfect for you.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [riotName, setRiotName] = useState("");
  const [riotId, setRiotId] = useState("");
  const [steamId, setSteamId] = useState("");
  const [fetchingProgress, setFetchingProgress] = useState(0);
  const [fetchingError, setFetchingError] = useState<string | null>(null);
  const [affinityData, setAffinityData] = useState<any>(null);
  const [completedTerms, setCompletedTerms] = useState<number[]>([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);

  // Fetch stats from backend when reaching the analyzing step
  useEffect(() => {
    if (currentStep === 1 && user) {
      const fetchAffinity = async () => {
        setFetchingProgress(0);
        setFetchingError(null);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFetchingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        try {
          const { data, error } = await getAffinity();
          
          clearInterval(progressInterval);
          setFetchingProgress(100);
          
          if (error) {
            setFetchingError(error.message || "Failed to fetch affinity data");
            return;
          }
          
          if (data) {
            // Store both Dota 2 and League data
            setAffinityData(data);
            // Move to next step after a short delay
            setTimeout(() => {
              setCurrentStep(2);
            }, 500);
          }
        } catch (err) {
          clearInterval(progressInterval);
          setFetchingError(err instanceof Error ? err.message : "An error occurred");
        }
      };

      // Small delay to ensure profile is saved before fetching
      const timeout = setTimeout(() => {
        fetchAffinity();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentStep, user]);

  // Handle typewriter completion - move to next term
  const handleTermComplete = (index: number) => {
    setCompletedTerms((prev) => [...prev, index]);
    if (index < leagueTerms.length - 1) {
      setTimeout(() => {
        setCurrentTermIndex(index + 1);
      }, 1000);
    }
  };


  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Save user profile before moving to analyzing step
      if (user) {
        if (!steamId && (!riotName || !riotId)) {
          alert("Please enter at least your Steam ID or Riot Name and ID");
          return;
        }

        try {
          const { error, success } = await saveUserProfile({
            riot_name: riotName.trim() || undefined,
            riot_id: riotId.trim() || undefined,
            steam_id: steamId.trim() || undefined,
          });

          if (error) {
            console.error("Error saving user profile:", error);
            alert(`Failed to save profile: ${error.message}`);
            return;
          }

          if (success) {
            console.log("Profile saved successfully");
          }
        } catch (error) {
          console.error("Exception saving user profile:", error);
          alert(`Error saving profile: ${error instanceof Error ? error.message : "Unknown error"}`);
          return;
        }
      } else {
        alert("Please log in to save your profile");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    // Mark onboarding as completed
    if (typeof window !== "undefined") {
      localStorage.setItem("spawner_onboarding_completed", "true");
    }
    router.push("/recommendations");
  };

  const canProceed = () => {
    if (currentStep === 0) {
      // Require at least Steam ID or Riot Name/ID
      return steamId.length > 0 || (riotName.length > 0 && riotId.length > 0);
    }
    if (currentStep === 2) {
      return completedTerms.length === leagueTerms.length;
    }
    // For analyzing step, don't allow manual progression
    if (currentStep === 1) {
      return false;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Link Your Gaming Profiles</h3>
              <p className="text-[#cfcfcf]">Connect your Dota 2 and League of Legends accounts</p>
            </div>

            {/* League of Legends / Riot Games */}
            <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardBody className="p-6 space-y-4">
                <div className="aspect-video bg-gradient-to-br from-[#0a1428] to-[#c89b3c] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                  LEAGUE OF LEGENDS
                </div>
                <Input
                  label="Riot Name"
                  placeholder="Your Riot username"
                  value={riotName}
                  onChange={(e) => setRiotName(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                  description="Your Riot Games username (the part before the #)"
                />
                <Input
                  label="Riot Tag"
                  placeholder="TAG"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value.toUpperCase())}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                  description="Your Riot Games tag (the part after the #, e.g., NA1, EUW)"
                  maxLength={5}
                />
              </CardBody>
            </Card>

            {/* Dota 2 / Steam */}
            <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardBody className="p-6 space-y-4">
                <div className="aspect-video bg-gradient-to-br from-[#d32ce6] to-[#2e4756] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                  DOTA 2
                </div>
                <Input
                  label="Steam ID"
                  placeholder="76561198XXXXXXXXX"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                  description="Your Steam 64-bit ID (can be found on your Steam profile page)"
                />
              </CardBody>
            </Card>
          </div>
        );
      case 1:
        const gamesToFetch = [
          (riotName && riotId) && "League of Legends",
          steamId && "Dota 2",
        ].filter(Boolean);

        return (
          <div className="space-y-8 max-w-md">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Analyzing your gameplay...</h3>
              <p className="text-[#cfcfcf]">Fetching match data and calculating your role affinity</p>
            </div>
            {fetchingError && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {fetchingError}
              </div>
            )}
            <div className="space-y-4">
              {gamesToFetch.map((game, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{game}</span>
                    <span className="text-[#ff7a00] text-sm">
                      {fetchingProgress >= (index + 1) * (100 / gamesToFetch.length)
                        ? "✓ Complete"
                        : `${Math.min(fetchingProgress - index * (100 / gamesToFetch.length), 100 / gamesToFetch.length).toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff7a00] transition-all duration-300"
                      style={{
                        width: `${
                          Math.max(
                            0,
                            Math.min(
                              (fetchingProgress - index * (100 / gamesToFetch.length)) /
                                (100 / gamesToFetch.length),
                              1
                            ) * 100
                          )
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 max-w-3xl">
            {leagueTerms.map((term, index) => {
              const isActive = index === currentTermIndex;
              const isCompleted = completedTerms.includes(index);
              const shouldShow = isActive || isCompleted;

              if (!shouldShow) return null;

              return (
                <div key={index} className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">{term.term}</h3>
                  <div className="min-h-[100px] text-lg text-[#cfcfcf] leading-relaxed">
                    {isCompleted ? (
                      <span>{term.explanation}</span>
                    ) : (
                      <Typewriter
                        text={term.explanation}
                        speed={20}
                        onComplete={() => handleTermComplete(index)}
                      />
                    )}
                  </div>
                  {index < leagueTerms.length - 1 && isCompleted && (
                    <div className="h-px bg-[#2b2b2b] my-6" />
                  )}
                </div>
              );
            })}
            {completedTerms.length === leagueTerms.length && (
              <div className="pt-8 border-t border-[#2b2b2b]">
                <Button
                  className="w-full bg-[#ff7a00] text-white hover:bg-[#ff8a20] text-lg py-6"
                  onPress={handleFinish}
                >
                  See What You Should Play
                </Button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageShell title="Onboarding" navItems={navItems}>
      <div className="max-w-3xl mx-auto">
        <StepWizard
          steps={steps}
          current={currentStep}
          onNext={handleNext}
          onBack={handleBack}
          onFinish={handleFinish}
          canProceed={canProceed()}
        >
          {renderStepContent()}
        </StepWizard>
      </div>
    </PageShell>
  );
}
