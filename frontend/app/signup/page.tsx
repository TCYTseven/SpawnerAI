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
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2b2b2b]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a1a1a] text-[#cfcfcf]">Or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="bordered"
                className="w-full border-[#2b2b2b] text-white hover:bg-[#2b2b2b]"
                startContent={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              >
                Sign up with Google
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
