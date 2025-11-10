"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { useState, useEffect, useRef } from "react";
import { getUserProfile, saveUserProfile } from "@/lib/userProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "AGENTS" },
  { label: "META", href: "/meta", section: "AGENTS" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Recommendations", href: "/recommendations", section: "Team" },
];

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [riotName, setRiotName] = useState("");
  const [riotId, setRiotId] = useState("");
  const [steamId, setSteamId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Load user profile on mount - ONLY ONCE
  useEffect(() => {
    if (hasFetchedRef.current || !user) {
      if (!user) {
        setLoading(false);
      }
      return;
    }

    hasFetchedRef.current = true;

    const loadProfile = async () => {
      setLoading(true);
      const { profile, error } = await getUserProfile();
      if (!error && profile) {
        setRiotName(profile.riot_name || "");
        setRiotId(profile.riot_id || "");
        setSteamId(profile.steam_id || "");
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      setSaveMessage("Please log in to save your profile");
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      const { error } = await saveUserProfile({
        riot_name: riotName || undefined,
        riot_id: riotId || undefined,
        steam_id: steamId || undefined,
      });

      if (error) {
        setSaveMessage(`Error saving profile: ${error.message}`);
      } else {
        setSaveMessage("Profile saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveMessage(`Error saving profile: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all local data? This cannot be undone.")) {
      // Mock reset
      alert("Local data reset (mock)");
    }
  };

  return (
    <PageShell
      title="Account Settings"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Account" }]}
      navItems={navItems}
    >
      <div className="space-y-6 max-w-3xl">
        {/* Profile */}
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-[#cfcfcf]">
              Manage your profile and playstyle preferences.
            </p>
            <div className="pt-4 border-t border-[#2b2b2b]">
              <Link
                as={NextLink}
                href="/onboarding"
                className="text-[#ff7a00] hover:text-[#ff8a20] text-sm"
              >
                Complete onboarding →
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Games & Profiles */}
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Gaming Profiles</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {saveMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  saveMessage.includes("Error")
                    ? "bg-red-500/10 border border-red-500/50 text-red-400"
                    : "bg-green-500/10 border border-green-500/50 text-green-400"
                }`}
              >
                {saveMessage}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">League of Legends</h3>
              <div className="space-y-4">
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
                  isDisabled={loading || saving}
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
                  isDisabled={loading || saving}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Dota 2</h3>
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
                isDisabled={loading || saving}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Apex Legends</h3>
              <Input
                label="Username"
                placeholder="Your Apex username"
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
                description="Your Apex Legends in-game username"
                isDisabled={loading || saving}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">CS:GO</h3>
              <Input
                label="Steam Profile URL"
                placeholder="https://steamcommunity.com/profiles/..."
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
                description="Your CS:GO Steam profile URL"
                isDisabled={loading || saving}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Fortnite</h3>
              <Input
                label="Epic Games Username"
                placeholder="Your Epic Games username"
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
                description="Your Epic Games username (used for Fortnite)"
                isDisabled={loading || saving}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Valorant</h3>
              <div className="space-y-4">
                <Input
                  label="Valorant Username"
                  placeholder="Your Valorant username"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                  description="Your Valorant in-game username"
                  isDisabled={loading || saving}
                />
                <Input
                  label="Valorant Tag"
                  placeholder="TAG"
                  maxLength={5}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                    label: "text-[#cfcfcf]",
                  }}
                  description="Your Valorant tag (the part after the #)"
                  isDisabled={loading || saving}
                />
              </div>
            </div>
            <Button
              className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
              onPress={handleSaveProfile}
              isLoading={saving}
              isDisabled={loading || saving || !user}
            >
              Save Profile
            </Button>
          </CardBody>
        </Card>

        {/* Visibility */}
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Visibility</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Public Profile</p>
                <p className="text-sm text-[#cfcfcf]">
                  Allow others to see your profile and playstyle
                </p>
              </div>
              <Switch
                isSelected={isPublic}
                onValueChange={setIsPublic}
                aria-label="Toggle public profile"
              />
            </div>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[#1a1a1a] border border-red-500/50">
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-white font-medium mb-2">Reset Local Data</p>
              <p className="text-sm text-[#cfcfcf] mb-4">
                This will reset all local data stored in your browser. This cannot be undone.
              </p>
              <Button
                color="danger"
                variant="bordered"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
                onPress={handleResetData}
              >
                Reset Local Data
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}

