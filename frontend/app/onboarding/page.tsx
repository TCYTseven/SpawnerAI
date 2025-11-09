"use client";

import { PageShell } from "@/components/layout/PageShell";
import { StepWizard } from "@/components/ui/StepWizard";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Typewriter } from "@/components/ui/Typewriter";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { initializeUserProfile, saveOnboardingData } from "@/lib/api";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
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
    key: "experience",
    title: "Gaming Experience",
    description: "Tell us about your experience",
  },
  {
    key: "fetching",
    title: "Analyzing",
    description: "Fetching your stats",
  },
  {
    key: "milestone",
    title: "Great Progress!",
    description: "You're doing amazing",
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
  // Game usernames
  const [apexUsername, setApexUsername] = useState("");
  const [csgoUsername, setCsgoUsername] = useState("");
  const [dota2Username, setDota2Username] = useState("");
  // Selected games
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  // Fortnite/Valorant/League experience
  const [hasPlayedFortnite, setHasPlayedFortnite] = useState(false);
  const [hasPlayedValorant, setHasPlayedValorant] = useState(false);
  const [hasPlayedLeague, setHasPlayedLeague] = useState(false);
  // Fortnite profile
  const [fortniteGamemode, setFortniteGamemode] = useState<string>("");
  const [fortniteRole, setFortniteRole] = useState<string>("");
  const [fortniteYears, setFortniteYears] = useState<string>("");
  const [fortniteCompetitive, setFortniteCompetitive] = useState(false);
  // Valorant profile
  const [valorantAgent, setValorantAgent] = useState<string>("");
  const [valorantMode, setValorantMode] = useState<string>("");
  const [valorantRole, setValorantRole] = useState<string>("");
  const [valorantCompetitive, setValorantCompetitive] = useState(false);
  const [valorantYears, setValorantYears] = useState<string>("");
  // League of Legends profile
  const [leagueRole, setLeagueRole] = useState<string>("");
  const [leagueChampion, setLeagueChampion] = useState<string>("");
  const [leagueMode, setLeagueMode] = useState<string>("");
  const [leagueYears, setLeagueYears] = useState<string>("");
  const [leagueCompetitive, setLeagueCompetitive] = useState(false);
  // Other state
  const [fetchingProgress, setFetchingProgress] = useState(0);
  const [fetchingError, setFetchingError] = useState<string | null>(null);
  const [affinityData, setAffinityData] = useState<any>(null);
  const [completedTerms, setCompletedTerms] = useState<number[]>([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);

  // Fetch stats from backend when reaching the analyzing step
  useEffect(() => {
    if (currentStep === 2 && user) {
      setFetchingProgress(0);
      setFetchingError(null);
      
      // Simulate progress - slower and more gradual
      const progressInterval = setInterval(() => {
        setFetchingProgress((prev) => {
          if (prev >= 95) {
            return 95;
          }
          return prev + Math.random() * 8 + 2; // Slower increment (2-10 per interval)
        });
      }, 500); // Slower interval (500ms instead of 300ms)

      // After simulated analysis, move to next step - longer duration
      const timeout = setTimeout(() => {
        clearInterval(progressInterval);
        setFetchingProgress(100);
        setTimeout(() => {
          setCurrentStep(3); // Move to milestone step
        }, 800);
      }, 6000); // 6 seconds instead of 2.5 seconds

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timeout);
      };
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

  const toggleGame = (gameId: string) => {
    setSelectedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
        // Clear username when unselected
        if (gameId === "apex") setApexUsername("");
        if (gameId === "csgo") setCsgoUsername("");
        if (gameId === "dota2") setDota2Username("");
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Allow proceeding even with nothing entered
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Experience step - can proceed if at least one toggle is on or both are off
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Analyzing step - auto-advances (handled by useEffect)
      return;
    } else if (currentStep === 3) {
      // Milestone step - move to terminology
      setCurrentStep(4);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    // Save all onboarding data to backend
    if (user) {
      try {
        // Prepare games data
        const gamesData: any = {};
        if (selectedGames.has("apex") && apexUsername) {
          gamesData.apex = apexUsername;
        }
        if (selectedGames.has("csgo") && csgoUsername) {
          gamesData.csgo = csgoUsername;
        }
        if (selectedGames.has("dota2") && dota2Username) {
          gamesData.dota2 = dota2Username;
        }

        // Prepare Fortnite data
        const fortniteData: any = {};
        if (hasPlayedFortnite) {
          if (fortniteGamemode) fortniteData.gamemode = fortniteGamemode;
          if (fortniteRole) fortniteData.role = fortniteRole;
          if (fortniteYears) fortniteData.years = fortniteYears;
          fortniteData.competitive = fortniteCompetitive;
        }

        // Prepare Valorant data
        const valorantData: any = {};
        if (hasPlayedValorant) {
          if (valorantAgent) valorantData.agent = valorantAgent;
          if (valorantMode) valorantData.mode = valorantMode;
          if (valorantRole) valorantData.role = valorantRole;
          if (valorantYears) valorantData.years = valorantYears;
          valorantData.competitive = valorantCompetitive;
        }

        // Prepare League data
        const leagueData: any = {};
        if (hasPlayedLeague) {
          if (leagueChampion) leagueData.champion = leagueChampion;
          if (leagueMode) leagueData.mode = leagueMode;
          if (leagueRole) leagueData.role = leagueRole;
          if (leagueYears) leagueData.years = leagueYears;
          leagueData.competitive = leagueCompetitive;
        }

        // Save onboarding data
        const { error } = await saveOnboardingData({
          games: Object.keys(gamesData).length > 0 ? gamesData : undefined,
          fortnite: Object.keys(fortniteData).length > 0 ? fortniteData : undefined,
          valorant: Object.keys(valorantData).length > 0 ? valorantData : undefined,
          league: Object.keys(leagueData).length > 0 ? leagueData : undefined,
        });

        if (error) {
          console.error("Error saving onboarding data:", error);
          // Still proceed even if save fails
        }
      } catch (err) {
        console.error("Exception saving onboarding data:", err);
        // Still proceed even if save fails
      }
    }

    // Mark onboarding as completed
    if (typeof window !== "undefined") {
      localStorage.setItem("spawner_onboarding_completed", "true");
    }
    router.push("/dashboard");
  };

  const canProceed = () => {
    if (currentStep === 0) {
      // Allow proceeding even with nothing entered
      return true;
    }
    if (currentStep === 1) {
      // Experience step - validate if toggles are on
      if (hasPlayedFortnite) {
        if (!fortniteGamemode || !fortniteRole || !fortniteYears) return false;
      }
      if (hasPlayedValorant) {
        if (!valorantAgent || !valorantMode || !valorantRole || !valorantYears) return false;
      }
      if (hasPlayedLeague) {
        if (!leagueRole || !leagueChampion || !leagueMode || !leagueYears) return false;
      }
      return true;
    }
    if (currentStep === 4) {
      return completedTerms.length === leagueTerms.length;
    }
    // For analyzing step, don't allow manual progression
    if (currentStep === 2) {
      return false;
    }
    // Milestone step - can always proceed
    if (currentStep === 3) {
      return true;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8 max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-3">Link Your Gaming Profiles</h3>
              <p className="text-lg text-[#cfcfcf]">Select all games you've played (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Apex Legends */}
              <div className={`bg-[#1a1a1a] rounded-2xl p-6 border transition-all cursor-pointer ${
                selectedGames.has("apex") 
                  ? "border-[#ff4655] shadow-lg shadow-[#ff4655]/20" 
                  : "border-[#2b2b2b] hover:border-[#ff4655]/50"
              }`} onClick={() => toggleGame("apex")}>
                <div className="bg-[#0d0d0d] rounded-xl p-4 mb-4 flex items-center justify-center">
                  <div className="w-32 h-32 relative">
                    <Image
                      src="/apex.png"
                      alt="Apex Legends"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-4 text-center">Apex Legends</h4>
                {selectedGames.has("apex") && (
                  <div className="animate-slide-down">
                    <Input
                      label="Origin/EA Username"
                      placeholder="Your EA username"
                      value={apexUsername}
                      onChange={(e) => setApexUsername(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b] rounded-lg",
                        label: "text-[#cfcfcf]",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* CS:GO */}
              <div className={`bg-[#1a1a1a] rounded-2xl p-6 border transition-all cursor-pointer ${
                selectedGames.has("csgo") 
                  ? "border-[#ff7a00] shadow-lg shadow-[#ff7a00]/20" 
                  : "border-[#2b2b2b] hover:border-[#ff7a00]/50"
              }`} onClick={() => toggleGame("csgo")}>
                <div className="bg-[#0d0d0d] rounded-xl p-4 mb-4 flex items-center justify-center">
                  <div className="w-32 h-32 relative">
                    <Image
                      src="/csgo.png"
                      alt="CS:GO"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-4 text-center">CS:GO</h4>
                {selectedGames.has("csgo") && (
                  <div className="animate-slide-down">
                    <Input
                      label="Steam Username"
                      placeholder="Your Steam username"
                      value={csgoUsername}
                      onChange={(e) => setCsgoUsername(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b] rounded-lg",
                        label: "text-[#cfcfcf]",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Dota 2 */}
              <div className={`bg-[#1a1a1a] rounded-2xl p-6 border transition-all cursor-pointer ${
                selectedGames.has("dota2") 
                  ? "border-[#d32ce6] shadow-lg shadow-[#d32ce6]/20" 
                  : "border-[#2b2b2b] hover:border-[#d32ce6]/50"
              }`} onClick={() => toggleGame("dota2")}>
                <div className="bg-[#0d0d0d] rounded-xl p-4 mb-4 flex items-center justify-center">
                  <div className="w-32 h-32 relative">
                    <Image
                      src="/dota2.png"
                      alt="Dota 2"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-4 text-center">Dota 2</h4>
                {selectedGames.has("dota2") && (
                  <div className="animate-slide-down">
                    <Input
                      label="Steam ID"
                      placeholder="Steam ID"
                      value={dota2Username}
                      onChange={(e) => setDota2Username(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b] rounded-lg",
                        label: "text-[#cfcfcf]",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 max-w-5xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-3">Have you played these games before?</h3>
              <p className="text-lg text-[#cfcfcf]">Help us build your gaming profile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Fortnite */}
              <div className={`bg-[#1a1a1a] rounded-2xl p-8 border transition-all duration-300 ${
                hasPlayedFortnite 
                  ? "border-[#ff7a00] shadow-lg shadow-[#ff7a00]/20" 
                  : "border-[#2b2b2b] hover:border-[#ff7a00]/50 hover:shadow-lg hover:shadow-[#ff7a00]/10"
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 transition-all duration-300 ${
                      hasPlayedFortnite 
                        ? "bg-[#0d0d0d] ring-2 ring-[#ff7a00]/50" 
                        : "bg-[#0d0d0d] hover:bg-[#141414]"
                    }`}>
                      <div className={`w-16 h-16 relative transition-transform duration-300 ${
                        hasPlayedFortnite ? "scale-100" : "scale-95 hover:scale-100"
                      }`}>
                        <Image
                          src="/fortnite.png"
                          alt="Fortnite"
                          fill
                          className={`object-contain rounded-lg transition-opacity duration-300 ${
                            hasPlayedFortnite ? "opacity-100" : "opacity-70 hover:opacity-100"
                          }`}
                        />
                      </div>
                    </div>
                    <h4 className={`text-xl font-semibold transition-colors duration-300 ${
                      hasPlayedFortnite ? "text-white" : "text-[#cfcfcf] hover:text-white"
                    }`}>
                      Fortnite
                    </h4>
                  </div>
                  <Switch
                    isSelected={hasPlayedFortnite}
                    onValueChange={setHasPlayedFortnite}
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-[#ff7a00]",
                    }}
                  />
                </div>
                {!hasPlayedFortnite && (
                  <p className="text-sm text-[#8a8a8a] text-center mt-4">
                    Toggle to add your gaming experience
                  </p>
                )}

                {hasPlayedFortnite && (
                  <div className="space-y-6 mt-6 pt-6 border-t border-[#2b2b2b]">
                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Favorite Gamemode</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Creative", "No Build", "Build", "Squads", "Solos", "Duos"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setFortniteGamemode(mode)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              fortniteGamemode === mode
                                ? "bg-[#ff7a00] text-white"
                                : "bg-[#0d0d0d] text-[#cfcfcf] hover:bg-[#2b2b2b]"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Your Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Fragger", "IGL"].map((role) => (
                          <button
                            key={role}
                            onClick={() => setFortniteRole(role)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              fortniteRole === role
                                ? "bg-[#ff7a00] text-white"
                                : "bg-[#0d0d0d] text-[#cfcfcf] hover:bg-[#2b2b2b]"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">
                        Years Played: {fortniteYears || "<1"}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={fortniteYears === "<1" ? 0 : fortniteYears === "1-2" ? 1 : fortniteYears === "2-3" ? 2 : fortniteYears === "3+" ? 3 : 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFortniteYears(val === 0 ? "<1" : val === 1 ? "1-2" : val === 2 ? "2-3" : "3+");
                        }}
                        className="w-full h-2 bg-[#0d0d0d] rounded-lg appearance-none cursor-pointer slider slider-fortnite"
                        style={{
                          background: `linear-gradient(to right, #ff7a00 0%, #ff7a00 ${(fortniteYears === "<1" ? 0 : fortniteYears === "1-2" ? 1 : fortniteYears === "2-3" ? 2 : fortniteYears === "3+" ? 3 : 0) * 33.33}%, #2b2b2b ${(fortniteYears === "<1" ? 0 : fortniteYears === "1-2" ? 1 : fortniteYears === "2-3" ? 2 : fortniteYears === "3+" ? 3 : 0) * 33.33}%, #2b2b2b 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-[#cfcfcf] mt-1">
                        <span>&lt;1</span>
                        <span>1-2</span>
                        <span>2-3</span>
                        <span>3+</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#2b2b2b]">
                      <span className="text-sm text-[#cfcfcf]">Played Competitively?</span>
                      <Switch
                        isSelected={fortniteCompetitive}
                        onValueChange={setFortniteCompetitive}
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-[#ff7a00]",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Valorant */}
              <div className={`bg-[#1a1a1a] rounded-2xl p-8 border transition-all duration-300 ${
                hasPlayedValorant 
                  ? "border-[#ff4655] shadow-lg shadow-[#ff4655]/20" 
                  : "border-[#2b2b2b] hover:border-[#ff4655]/50 hover:shadow-lg hover:shadow-[#ff4655]/10"
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 transition-all duration-300 ${
                      hasPlayedValorant 
                        ? "bg-[#0d0d0d] ring-2 ring-[#ff4655]/50" 
                        : "bg-[#0d0d0d] hover:bg-[#141414]"
                    }`}>
                      <div className={`w-16 h-16 relative transition-transform duration-300 ${
                        hasPlayedValorant ? "scale-100" : "scale-95 hover:scale-100"
                      }`}>
                        <Image
                          src="/valorant.png"
                          alt="Valorant"
                          fill
                          className={`object-contain rounded-lg transition-opacity duration-300 ${
                            hasPlayedValorant ? "opacity-100" : "opacity-70 hover:opacity-100"
                          }`}
                        />
                      </div>
                    </div>
                    <h4 className={`text-xl font-semibold transition-colors duration-300 ${
                      hasPlayedValorant ? "text-white" : "text-[#cfcfcf] hover:text-white"
                    }`}>
                      Valorant
                    </h4>
                  </div>
                  <Switch
                    isSelected={hasPlayedValorant}
                    onValueChange={setHasPlayedValorant}
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-[#ff4655]",
                    }}
                  />
                </div>
                {!hasPlayedValorant && (
                  <p className="text-sm text-[#8a8a8a] text-center mt-4">
                    Toggle to add your gaming experience
                  </p>
                )}

                {hasPlayedValorant && (
                  <div className="space-y-6 mt-6 pt-6 border-t border-[#2b2b2b]">
                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Favorite Agent</label>
                      <Input
                        placeholder="e.g., Jett, Sage, Omen"
                        value={valorantAgent}
                        onChange={(e) => setValorantAgent(e.target.value)}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b] rounded-lg",
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Favorite Mode</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Unrated", "Competitive", "Spike Rush", "Deathmatch"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setValorantMode(mode)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              valorantMode === mode
                                ? "bg-[#ff4655] text-white"
                                : "bg-[#0d0d0d] text-[#cfcfcf] hover:bg-[#2b2b2b]"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Your Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Initiator", "Duelist", "Controller", "Sentinel"].map((role) => (
                          <button
                            key={role}
                            onClick={() => setValorantRole(role)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              valorantRole === role
                                ? "bg-[#ff4655] text-white"
                                : "bg-[#0d0d0d] text-[#cfcfcf] hover:bg-[#2b2b2b]"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">
                        Years Played: {valorantYears || "<1"}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={valorantYears === "<1" ? 0 : valorantYears === "1-2" ? 1 : valorantYears === "2-3" ? 2 : valorantYears === "3+" ? 3 : 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setValorantYears(val === 0 ? "<1" : val === 1 ? "1-2" : val === 2 ? "2-3" : "3+");
                        }}
                        className="w-full h-2 bg-[#0d0d0d] rounded-lg appearance-none cursor-pointer slider slider-valorant"
                        style={{
                          background: `linear-gradient(to right, #ff4655 0%, #ff4655 ${(valorantYears === "<1" ? 0 : valorantYears === "1-2" ? 1 : valorantYears === "2-3" ? 2 : valorantYears === "3+" ? 3 : 0) * 33.33}%, #2b2b2b ${(valorantYears === "<1" ? 0 : valorantYears === "1-2" ? 1 : valorantYears === "2-3" ? 2 : valorantYears === "3+" ? 3 : 0) * 33.33}%, #2b2b2b 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-[#cfcfcf] mt-1">
                        <span>&lt;1</span>
                        <span>1-2</span>
                        <span>2-3</span>
                        <span>3+</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#2b2b2b]">
                      <span className="text-sm text-[#cfcfcf]">Played Competitively?</span>
                      <Switch
                        isSelected={valorantCompetitive}
                        onValueChange={setValorantCompetitive}
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-[#ff4655]",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* League of Legends */}
              <div className={`bg-[#1a1a1a] rounded-2xl p-8 border transition-all duration-300 ${
                hasPlayedLeague 
                  ? "border-[#c89b3c] shadow-lg shadow-[#c89b3c]/20" 
                  : "border-[#2b2b2b] hover:border-[#c89b3c]/50 hover:shadow-lg hover:shadow-[#c89b3c]/10"
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 transition-all duration-300 ${
                      hasPlayedLeague 
                        ? "bg-[#0d0d0d] ring-2 ring-[#c89b3c]/50" 
                        : "bg-[#0d0d0d] hover:bg-[#141414]"
                    }`}>
                      <div className={`w-16 h-16 relative transition-transform duration-300 ${
                        hasPlayedLeague ? "scale-100" : "scale-95 hover:scale-100"
                      }`}>
                        <Image
                          src="/leauge.png"
                          alt="League of Legends"
                          fill
                          className={`object-contain rounded-lg transition-opacity duration-300 ${
                            hasPlayedLeague ? "opacity-100" : "opacity-70 hover:opacity-100"
                          }`}
                        />
                      </div>
                    </div>
                    <h4 className={`text-xl font-semibold transition-colors duration-300 ${
                      hasPlayedLeague ? "text-white" : "text-[#cfcfcf] hover:text-white"
                    }`}>
                      League of Legends
                    </h4>
                  </div>
                  <Switch
                    isSelected={hasPlayedLeague}
                    onValueChange={setHasPlayedLeague}
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-[#c89b3c]",
                    }}
                  />
                </div>
                {!hasPlayedLeague && (
                  <p className="text-sm text-[#8a8a8a] text-center mt-4">
                    Toggle to add your gaming experience
                  </p>
                )}

                {hasPlayedLeague && (
                  <div className="space-y-6 mt-6 pt-6 border-t border-[#2b2b2b]">
                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Favorite Champion</label>
                      <Input
                        placeholder="e.g., Yasuo, Jinx, Thresh"
                        value={leagueChampion}
                        onChange={(e) => setLeagueChampion(e.target.value)}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b] rounded-lg",
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Favorite Mode</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Ranked", "Normal", "ARAM", "TFT"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setLeagueMode(mode)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              leagueMode === mode
                                ? "bg-[#c89b3c] text-white"
                                : "bg-[#0d0d0d] text-[#cfcfcf] hover:bg-[#2b2b2b]"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">Your Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Top", "Jungle", "Mid", "ADC", "Support"].map((role) => (
                          <button
                            key={role}
                            onClick={() => setLeagueRole(role)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              leagueRole === role
                                ? "bg-[#c89b3c] text-white"
                                : "bg-[#0d0d0d] text-[#cfcfcf] hover:bg-[#2b2b2b]"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-[#cfcfcf] mb-2 block">
                        Years Played: {leagueYears || "<1"}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={leagueYears === "<1" ? 0 : leagueYears === "1-2" ? 1 : leagueYears === "2-3" ? 2 : leagueYears === "3+" ? 3 : 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLeagueYears(val === 0 ? "<1" : val === 1 ? "1-2" : val === 2 ? "2-3" : "3+");
                        }}
                        className="w-full h-2 bg-[#0d0d0d] rounded-lg appearance-none cursor-pointer slider slider-league"
                        style={{
                          background: `linear-gradient(to right, #c89b3c 0%, #c89b3c ${(leagueYears === "<1" ? 0 : leagueYears === "1-2" ? 1 : leagueYears === "2-3" ? 2 : leagueYears === "3+" ? 3 : 0) * 33.33}%, #2b2b2b ${(leagueYears === "<1" ? 0 : leagueYears === "1-2" ? 1 : leagueYears === "2-3" ? 2 : leagueYears === "3+" ? 3 : 0) * 33.33}%, #2b2b2b 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-[#cfcfcf] mt-1">
                        <span>&lt;1</span>
                        <span>1-2</span>
                        <span>2-3</span>
                        <span>3+</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#2b2b2b]">
                      <span className="text-sm text-[#cfcfcf]">Played Competitively?</span>
                      <Switch
                        isSelected={leagueCompetitive}
                        onValueChange={setLeagueCompetitive}
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-[#c89b3c]",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        const gamesToFetch = [
          selectedGames.has("apex") && apexUsername && "Apex Legends",
          selectedGames.has("csgo") && csgoUsername && "CS:GO",
          selectedGames.has("dota2") && dota2Username && "Dota 2",
        ].filter(Boolean);

        // If no games selected, show a message
        if (gamesToFetch.length === 0) {
          return (
            <div className="max-w-2xl mx-auto">
              <div className="text-center space-y-6 py-12">
                <div className="inline-block w-16 h-16 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">Analyzing your profile...</h3>
                <p className="text-[#cfcfcf] text-lg">Processing your gaming experience data</p>
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-block w-16 h-16 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-2" />
                <h3 className="text-2xl font-semibold text-white">Analyzing your gameplay...</h3>
                <p className="text-[#cfcfcf] text-lg">Fetching match data and calculating your role affinity</p>
              </div>
              
              {fetchingError && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {fetchingError}
                </div>
              )}
              
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2b2b2b] space-y-6">
                {gamesToFetch.map((game, index) => {
                  const gameProgress = Math.max(
                    0,
                    Math.min(
                      (fetchingProgress - index * (100 / gamesToFetch.length)) /
                        (100 / gamesToFetch.length),
                      1
                    ) * 100
                  );
                  const isComplete = fetchingProgress >= (index + 1) * (100 / gamesToFetch.length);
                  
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-lg">{game}</span>
                        <span className={`text-sm font-semibold ${isComplete ? "text-[#ff7a00]" : "text-[#cfcfcf]"}`}>
                          {isComplete ? (
                            <span className="flex items-center gap-2">
                              <span className="text-green-400">✓</span>
                              Complete
                            </span>
                          ) : (
                            `${gameProgress.toFixed(0)}%`
                          )}
                        </span>
                      </div>
                      <div className="h-3 bg-[#0d0d0d] rounded-full overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isComplete ? "bg-[#ff7a00]" : "bg-gradient-to-r from-[#ff7a00] to-[#ff8a20]"
                          }`}
                          style={{ width: `${gameProgress}%` }}
                        />
                        {!isComplete && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-8 py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#ff7a00] to-[#ff8a20] mb-4">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">You're doing great!</h3>
              <p className="text-xl text-[#cfcfcf] mb-6">
                We can tell you're gonna be a natural :)
              </p>
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2b2b2b] mt-8">
                <p className="text-lg text-[#cfcfcf] leading-relaxed">
                  Next, we'll teach you some basic League of Legends terminology that will help you understand your team composition and role preferences better.
                </p>
              </div>
            </div>
          </div>
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
                        speed={4}
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

          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageShell title="Onboarding" navItems={navItems}>
      <div className="max-w-7xl mx-auto">
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
