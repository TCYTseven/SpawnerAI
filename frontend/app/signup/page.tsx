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
import { signUp } from "@/lib/auth";
import { checkProfileExists } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, error: signUpError } = await signUp(email, password);

      if (signUpError) {
        const errorMsg = signUpError.message || "";
        const isDuplicate = 
          errorMsg.includes("already registered") ||
          errorMsg.includes("already in use") ||
          errorMsg.includes("already exists") ||
          (errorMsg.toLowerCase().includes("email") && errorMsg.toLowerCase().includes("already"));
        
        if (isDuplicate) {
          setError("This email is already signed up. Redirecting to login...");
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(email)}`);
          }, 1500);
        } else {
          setError(signUpError.message);
          setLoading(false);
        }
        return;
      }

      if (user) {
        const { error: profileError } = await checkProfileExists();
        
        if (profileError && profileError.status === 409) {
          setError("This email already has a profile. Redirecting to login...");
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(email)}`);
          }, 1500);
          return;
        }
        
        router.push("/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
      setLoading(false);
    }
  };

  const handleContinueWithoutAccount = () => {
    const onboardingCompleted = typeof window !== "undefined" && localStorage.getItem("spawner_onboarding_completed") === "true";
    router.push(onboardingCompleted ? "/dashboard" : "/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] text-white">
      <TopNav links={siteConfig.navItems} />
      <div className="container mx-auto max-w-md px-6 py-20">
        <Card className="bg-[#1a1a1a] border border-[#2b2b2b]">
          <CardHeader className="flex flex-col items-start pb-4">
            <h1 className="text-2xl font-bold text-white">Sign up</h1>
            <p className="text-sm text-[#cfcfcf]">Create your Spawner – AI account</p>
          </CardHeader>
          <CardBody className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
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
                isDisabled={loading}
              />
              <Input
                type="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
                  label: "text-[#cfcfcf]",
                }}
                aria-label="Password"
                required
                isDisabled={loading}
              />
              <Button
                type="submit"
                className="w-full bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
                isLoading={loading}
                isDisabled={loading}
              >
                Continue
              </Button>
            </form>
            <div className="pt-4 border-t border-[#2b2b2b]">
              <p className="text-sm text-center text-[#cfcfcf] mb-2">
                Already have an account?{" "}
                <Link
                  as={NextLink}
                  href="/login"
                  className="text-[#ff7a00] hover:text-[#ff8a20]"
                >
                  Log in
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
