"use client";

import { PageShell } from "@/components/layout/PageShell";
import { StepWizard } from "@/components/ui/StepWizard";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { BehaviorSliders } from "@/components/ui/BehaviorSliders";
import { Typewriter } from "@/components/ui/Typewriter";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

const steps = [
  {
    key: "basics",
    title: "Basics",
    description: "Tell us about yourself",
  },
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
    key: "behaviors",
    title: "Behaviors",
    description: "Describe your playstyle",
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
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [fortniteUsername, setFortniteUsername] = useState("");
  const [valorantUsername, setValorantUsername] = useState("");
  const [apexUsername, setApexUsername] = useState("");
  const [fetchingProgress, setFetchingProgress] = useState(0);
  const [behaviors, setBehaviors] = useState({
    aggression: 50,
    positioning: 50,
    utility: 50,
    clutch: 50,
    awareness: 50,
  });
  const [completedTerms, setCompletedTerms] = useState<number[]>([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);

  // Simulate fetching stats
  useEffect(() => {
    if (currentStep === 2) {
      setFetchingProgress(0);
      const interval = setInterval(() => {
        setFetchingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setCurrentStep(3);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Handle typewriter completion - move to next term
  const handleTermComplete = (index: number) => {
    setCompletedTerms((prev) => [...prev, index]);
    if (index < leagueTerms.length - 1) {
      setTimeout(() => {
        setCurrentTermIndex(index + 1);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Mark onboarding as completed
    if (typeof window !== "undefined") {
      localStorage.setItem("spawner_onboarding_completed", "true");
    }
    router.push("/recommendations");
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return name.length > 0 && age.length > 0 && country.length > 0;
    }
    if (currentStep === 1) {
      return fortniteUsername.length > 0 || valorantUsername.length > 0 || apexUsername.length > 0;
    }
    if (currentStep === 4) {
      return completedTerms.length === leagueTerms.length;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 max-w-md">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              classNames={{
                input: "text-white",
                inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                label: "text-[#cfcfcf]",
              }}
              aria-label="Name"
            />
            <Input
              type="number"
              label="Age"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              classNames={{
                input: "text-white",
                inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                label: "text-[#cfcfcf]",
              }}
              aria-label="Age"
            />
            <Input
              label="Country"
              placeholder="Enter your country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              classNames={{
                input: "text-white",
                inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                label: "text-[#cfcfcf]",
              }}
              aria-label="Country"
            />
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {/* Fortnite */}
            <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardBody className="p-6 space-y-4">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                  FORTNITE
                </div>
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={fortniteUsername}
                  onChange={(e) => setFortniteUsername(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                />
                <Input
                  type="number"
                  label="Years Played"
                  placeholder="0"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                />
                <Select
                  label="Skill Type"
                  placeholder="Select role"
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                    label: "text-[#cfcfcf]",
                  }}
                >
                  <SelectItem key="fragger">Fragger</SelectItem>
                  <SelectItem key="in-game-leader">In Game Leader</SelectItem>
                  <SelectItem key="support">Support</SelectItem>
                  <SelectItem key="builder">Builder</SelectItem>
                </Select>
              </CardBody>
            </Card>

            {/* Apex Legends */}
            <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardBody className="p-6 space-y-4">
                <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                  APEX
                </div>
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={apexUsername}
                  onChange={(e) => setApexUsername(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                />
                <Input
                  type="number"
                  label="Years Played"
                  placeholder="0"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                />
                <Select
                  label="Skill Type"
                  placeholder="Select role"
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                    label: "text-[#cfcfcf]",
                  }}
                >
                  <SelectItem key="fragger">Fragger</SelectItem>
                  <SelectItem key="support">Support</SelectItem>
                  <SelectItem key="entry">Entry</SelectItem>
                  <SelectItem key="igl">IGL</SelectItem>
                </Select>
              </CardBody>
            </Card>

            {/* Valorant */}
            <Card className="bg-[#1a1a1a] border-2 border-[#2b2b2b]">
              <CardBody className="p-6 space-y-4">
                <div className="aspect-video bg-gradient-to-br from-red-600 to-black rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-4">
                  V
                </div>
                <Input
                  label="Username"
                  placeholder="username#tag"
                  value={valorantUsername}
                  onChange={(e) => setValorantUsername(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                />
                <Input
                  type="number"
                  label="Years Played"
                  placeholder="0"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                />
                <Select
                  label="Skill Type"
                  placeholder="Select role"
                  classNames={{
                    trigger: "bg-[#0d0d0d] border-[#2b2b2b]",
                    value: "text-white",
                    label: "text-[#cfcfcf]",
                  }}
                >
                  <SelectItem key="fragger">Fragger</SelectItem>
                  <SelectItem key="support">Support</SelectItem>
                  <SelectItem key="duelist">Duelist</SelectItem>
                  <SelectItem key="controller">Controller</SelectItem>
                  <SelectItem key="initiator">Initiator</SelectItem>
                  <SelectItem key="sentinel">Sentinel</SelectItem>
                </Select>
              </CardBody>
            </Card>
          </div>
        );
      case 2:
        const gamesToFetch = [
          fortniteUsername && "Fortnite",
          valorantUsername && "Valorant",
          apexUsername && "Apex Legends",
        ].filter(Boolean);

        return (
          <div className="space-y-8 max-w-md">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Fetching your stats...</h3>
              <p className="text-[#cfcfcf]">Analyzing your gameplay data</p>
            </div>
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
      case 3:
        return (
          <BehaviorSliders
            behaviors={behaviors}
            onChange={(key, value) => setBehaviors({ ...behaviors, [key]: value })}
          />
        );
      case 4:
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
