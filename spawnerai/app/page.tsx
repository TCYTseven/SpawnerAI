import { TopNav } from "@/components/navigation/TopNav";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <TopNav links={siteConfig.navItems} />

      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6">
        <div className="max-w-2xl mx-auto text-center space-y-12">
          <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight">
            League is complex.
            <br />
            <span className="text-[#ff7a00] font-normal">We make it simple.</span>
          </h1>
          
          <p className="text-lg text-[#cfcfcf] max-w-xl mx-auto leading-relaxed">
            Translate your playstyle from Fortnite, Valorant, and Apex into League roles and team comps.
          </p>
          
          <div className="pt-4">
            <Button
              as={NextLink}
              href="/signup"
              size="lg"
              className="bg-[#ff7a00] text-white hover:bg-[#ff8a20] px-8 py-6 text-base font-medium rounded"
            >
              Get Started
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
