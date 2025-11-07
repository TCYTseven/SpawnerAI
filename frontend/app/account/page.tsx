"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { PlaystyleTagSelector } from "@/components/ui/PlaystyleTagSelector";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "Squad", href: "/squad", section: "Team" },
  { label: "Simulate", href: "/simulate", section: "Team" },
  { label: "Report", href: "/report/example", section: "Team" },
  { label: "Champions", href: "/champions", section: "Team" },
  { label: "Onboarding", href: "/onboarding", section: "Setup" },
];

export default function AccountPage() {
  const [fortniteTags, setFortniteTags] = useState<string[]>(["Builder", "Aggressive"]);
  const [valorantTags, setValorantTags] = useState<string[]>(["Duelist", "Aggressive"]);
  const [apexTags, setApexTags] = useState<string[]>(["Fragger"]);
  const [isPublic, setIsPublic] = useState(false);

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
          </CardBody>
        </Card>

        {/* Games & Tags */}
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Games & Playstyle</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Fortnite</h3>
              <PlaystyleTagSelector
                game="fortnite"
                selected={fortniteTags}
                onChange={setFortniteTags}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Valorant</h3>
              <PlaystyleTagSelector
                game="valorant"
                selected={valorantTags}
                onChange={setValorantTags}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Apex Legends</h3>
              <PlaystyleTagSelector game="apex" selected={apexTags} onChange={setApexTags} />
            </div>
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

