import { Navigation } from "@/components/navigation";
import { ProfileSection } from "@/components/profile-section";
import { InfoCards } from "@/components/info-cards";
import { SkillsSection } from "@/components/skills-section";
import { PortfolioSection } from "@/components/portfolio-section";
import { Background } from "@/components/background";

export default function Home() {
  return (
    <>
      <Background />
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto w-full">
          {/* Hero Section */}
          <ProfileSection />

          {/* About Section */}
          <InfoCards />

          {/* Skills Section */}
          <SkillsSection />

          {/* Portfolio Section */}
          <PortfolioSection />
        </div>
      </main>
    </>
  );
}
