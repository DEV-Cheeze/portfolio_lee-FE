"use client";

import { useRef, useEffect, useState } from "react";
import {
  Braces,
  Code2,
  Database,
  Server,
  Cloud,
  GitBranch,
  Shield,
  Boxes,
  Workflow,
  Terminal,
  Search,
  Cpu,
} from "lucide-react";

type LevelKey = "하" | "중" | "상";

interface SkillIcon {
  id: string;
  name: string;
  level: LevelKey;
  category: "Backend" | "Database" | "DevOps";
  Icon: React.ComponentType<{ className?: string }>;
}

const levelText: Record<LevelKey, string> = {
  하: "Basic",
  중: "Intermediate",
  상: "Advanced",
};

const levelMeter: Record<LevelKey, number> = {
  하: 1,
  중: 2,
  상: 3,
};

const skills: SkillIcon[] = [
  // Backend
  { id: "java", name: "Java", level: "상", category: "Backend", Icon: Code2 },
  { id: "spring-boot", name: "Spring Boot", level: "상", category: "Backend", Icon: Server },
  { id: "spring-security", name: "Spring Security", level: "상", category: "Backend", Icon: Shield },
  { id: "jpa", name: "JPA/Hibernate", level: "상", category: "Backend", Icon: Braces },
  { id: "node", name: "Node.js", level: "중", category: "Backend", Icon: Cpu },
  { id: "python", name: "Python", level: "중", category: "Backend", Icon: Terminal },

  // Database
  { id: "postgres", name: "PostgreSQL", level: "상", category: "Database", Icon: Database },
  { id: "mysql", name: "MySQL", level: "상", category: "Database", Icon: Database },
  { id: "redis", name: "Redis", level: "중", category: "Database", Icon: Boxes },
  { id: "mongodb", name: "MongoDB", level: "중", category: "Database", Icon: Database },
  { id: "elastic", name: "Elasticsearch", level: "하", category: "Database", Icon: Search },

  // DevOps
  { id: "docker", name: "Docker", level: "상", category: "DevOps", Icon: Boxes },
  { id: "kubernetes", name: "Kubernetes", level: "중", category: "DevOps", Icon: Cloud },
  { id: "aws", name: "AWS", level: "중", category: "DevOps", Icon: Cloud },
  { id: "cicd", name: "CI/CD", level: "상", category: "DevOps", Icon: Workflow },
  { id: "git", name: "Git", level: "상", category: "DevOps", Icon: GitBranch },
  { id: "linux", name: "Linux", level: "중", category: "DevOps", Icon: Terminal },
];

const categories: Array<SkillIcon["category"]> = ["Backend", "Database", "DevOps"];

function SkillLevelTooltip({ level }: { level: LevelKey }) {
  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold tracking-tight text-foreground">
          {levelText[level]}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">{level}</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= levelMeter[level] ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const activeSkill = hovered
    ? skills.find((s) => s.id === hovered) ?? null
    : null;

  return (
    <section ref={sectionRef} className="py-24" data-testid="section-skills">
      <div
        className={`flex items-center gap-4 mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2
          className="text-sm font-medium tracking-widest uppercase text-muted-foreground"
          data-testid="text-skills-title"
        >
          Skills
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="grid-skills">
        {categories.map((category, categoryIndex) => (
          <div
            key={category}
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: `${categoryIndex * 150}ms` }}
            data-testid={`panel-skills-${category}`}
          >
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border h-12">
              <h3
                className="text-lg font-semibold text-foreground"
                data-testid={`text-skills-category-${category}`}
              >
                {category}
              </h3>
              
              <div className="relative h-full flex items-center">
                <div
                  className={`absolute right-0 transition-all duration-200 transform ${
                    activeSkill?.category === category
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 translate-x-4 scale-95 pointer-events-none"
                  }`}
                >
                  {activeSkill?.category === category && (
                    <div className="rounded-xl border border-glass-border bg-glass/90 backdrop-blur-xl px-3 py-2 shadow-xl ring-1 ring-black/5">
                      <SkillLevelTooltip level={activeSkill.level} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3"
              data-testid={`grid-skills-icons-${category}`}
            >
              {skills
                .filter((skill) => skill.category === category)
                .map((skill, index) => {
                  const Icon = skill.Icon;
                  const isActive = hovered === skill.id;

                  return (
                    <div key={skill.id} className="relative z-0 hover:z-50">
                      <button
                        type="button"
                        data-testid={`button-skill-${skill.id}`}
                        onMouseEnter={() => setHovered(skill.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(skill.id)}
                        onBlur={() => setHovered(null)}
                        className={`group relative aspect-square w-full rounded-2xl border bg-card transition-all duration-200 ease-out ${
                          isActive
                            ? "-translate-y-1 border-primary shadow-xl scale-105"
                            : "border-border hover:-translate-y-1 hover:border-primary/40"
                        }`}
                        style={{
                          // removed transitionDelay from individual items once visible to ensure instant interaction
                          transitionDelay: isVisible ? "0ms" : `${categoryIndex * 150 + index * 70}ms`,
                        }}
                      >
                        <span className="relative flex h-full w-full items-center justify-center">
                          <Icon className={`w-6 h-6 text-foreground stroke-[1.5px] transition-transform duration-200 ease-out ${isActive ? "scale-110" : ""}`} />
                        </span>

                        <span
                          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 z-[100] whitespace-nowrap rounded-lg border border-glass-border bg-foreground px-2.5 py-1.5 text-[10px] font-bold text-background shadow-2xl transition-all duration-200 ease-out ${
                            isActive
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 -translate-y-1"
                          }`}
                        >
                          {skill.name.toUpperCase()}
                        </span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
