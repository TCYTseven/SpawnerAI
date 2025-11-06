"use client";

import { TopNav } from "@/components/navigation/TopNav";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { siteConfig } from "@/config/site";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NextLink from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - check onboarding status
    const onboardingCompleted = typeof window !== "undefined" && localStorage.getItem("spawner_onboarding_completed") === "true";
    router.push(onboardingCompleted ? "/dashboard" : "/onboarding");
  };

  const handleContinueWithoutAccount = () => {
    // Mock - check onboarding status
    const onboardingCompleted = typeof window !== "undefined" && localStorage.getItem("spawner_onboarding_completed") === "true";
    router.push(onboardingCompleted ? "/dashboard" : "/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] text-white">
      <TopNav links={siteConfig.navItems} />
      <div className="container mx-auto max-w-md px-6 py-20">
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
          <CardHeader className="flex flex-col items-start pb-4">
            <h1 className="text-2xl font-bold text-white">Log in</h1>
            <p className="text-sm text-[#cfcfcf]">Welcome back to Spawner – AI</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
                aria-label="Email address"
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
                aria-label="Password"
                required
              />
              <Button
                type="submit"
                className="w-full bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
              >
                Continue
              </Button>
            </form>
            <div className="pt-4 border-t border-[#2b2b2b]">
              <p className="text-sm text-center text-[#cfcfcf] mb-2">
                Don't have an account?{" "}
                <Link
                  as={NextLink}
                  href="/signup"
                  className="text-[#ff7a00] hover:text-[#ff8a20]"
                >
                  Sign up
                </Link>
              </p>
              <Button
                variant="light"
                className="w-full text-[#cfcfcf] hover:text-white"
                onPress={handleContinueWithoutAccount}
              >
                Continue without account
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

