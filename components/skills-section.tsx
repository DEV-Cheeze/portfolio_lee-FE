"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Category = "Backend" | "Database" | "DevOps";

type IconType = "remote" | "spring-security" | "querydsl";

interface SkillItem {
  id: string;
  name: string;
  role: string;
  score: number;
  category: Category;
  iconType?: IconType;
  iconSlug?: string;
}

const categories: Category[] = ["Backend", "Database", "DevOps"];

const categoryDescriptions: Record<Category, string> = {
  Backend: "서버 애플리케이션 설계와 API 구현 중심",
  Database: "데이터 저장 구조와 조회 성능 최적화 중심",
  DevOps: "배포 자동화, 운영 환경, 모니터링 경험 중심",
};

const skills: SkillItem[] = [
  { id: "java", name: "Java", role: "Language", score: 5, category: "Backend", iconSlug: "openjdk" },
  { id: "spring-boot", name: "Spring Boot", role: "Framework", score: 5, category: "Backend", iconSlug: "spring" },
  { id: "spring-security", name: "Spring Security", role: "Security", score: 4, category: "Backend", iconType: "spring-security" },
  { id: "jpa-hibernate", name: "JPA / Hibernate", role: "ORM", score: 5, category: "Backend", iconSlug: "hibernate" },
  { id: "querydsl", name: "Query DSL", role: "Query Builder", score: 3, category: "Backend", iconType: "querydsl" },
  { id: "nodejs", name: "Node.js", role: "Runtime", score: 2, category: "Backend", iconSlug: "nodedotjs" },
  { id: "express", name: "Express.js", role: "Web Framework", score: 2, category: "Backend", iconSlug: "express" },

  { id: "mysql", name: "MySQL", role: "RDBMS", score: 5, category: "Database", iconSlug: "mysql" },
  { id: "oracle", name: "Oracle", role: "RDBMS", score: 3, category: "Database", iconSlug: "oracle" },
  { id: "postgresql", name: "PostgreSQL", role: "RDBMS", score: 2, category: "Database", iconSlug: "postgresql" },
  { id: "redis", name: "Redis", role: "Cache / NoSQL", score: 3, category: "Database", iconSlug: "redis" },
  { id: "elasticsearch", name: "ElasticSearch", role: "Search Engine", score: 1, category: "Database", iconSlug: "elasticsearch" },

  { id: "docker", name: "Docker", role: "Containerization", score: 4, category: "DevOps", iconSlug: "docker" },
  { id: "git", name: "Git", role: "Version Control", score: 4, category: "DevOps", iconSlug: "git" },
  { id: "aws", name: "AWS", role: "Cloud", score: 4, category: "DevOps", iconSlug: "amazonwebservices" },
  { id: "linux", name: "Linux", role: "OS / Server", score: 3, category: "DevOps", iconSlug: "linux" },
  { id: "grafana", name: "Grafana", role: "Monitoring", score: 3, category: "DevOps", iconSlug: "grafana" },
  { id: "junit", name: "JUnit", role: "Testing", score: 3, category: "DevOps", iconSlug: "junit5" },
];

const skillLevelLabels: Record<number, string> = {
  1: "Beginner",
  2: "Basic",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const iconAdjustments: Record<string, string> = {
  java: "scale-[1.02]",
  "spring-boot": "scale-[1.06]",
  nodejs: "scale-[1.06]",
  express: "scale-[1.08]",
  mysql: "scale-[1.12]",
  oracle: "scale-[1.08]",
  redis: "scale-[1.1]",
  elasticsearch: "scale-[1.06]",
  docker: "scale-[1.16] -translate-y-[0.5px]",
  git: "scale-[1.08] -translate-y-[0.5px]",
  aws: "scale-[1.18]",
  linux: "scale-[1.12] -translate-y-[0.5px]",
  grafana: "scale-[1.08]",
  junit: "scale-[1.04]",
};


const categoryBadgeClasses: Record<Category, string> = {
  Backend: "bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/12 dark:bg-sky-500/16 dark:text-sky-300 dark:ring-sky-400/12",
  Database: "bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/12 dark:bg-violet-500/16 dark:text-violet-300 dark:ring-violet-400/12",
  DevOps: "bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/12 dark:bg-rose-500/16 dark:text-rose-300 dark:ring-rose-400/12",
};

function SpringSecurityIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M32 6 52 14v16c0 13.6-8.2 22.7-20 28C20.2 52.7 12 43.6 12 30V14L32 6Z"
        fill="currentColor"
      />
      <circle cx="32" cy="28" r="9" fill="hsl(var(--background))" />
      <path
        d="M32.2 22.6a3.2 3.2 0 0 0-3.2 3.2c0 1.2.65 2.24 1.62 2.8V35h3v-3.56a3.2 3.2 0 0 0-1.4-5.84Zm0 2a1.2 1.2 0 0 1 .74 2.14l-.34.26V29h-1v-1.99l-.34-.26a1.2 1.2 0 0 1 .94-2.15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function QueryDslIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="48" cy="46" r="6" fill="currentColor" />
      <circle cx="18" cy="18" r="2.2" fill="currentColor" />
      <circle cx="26" cy="13" r="2.7" fill="currentColor" />
      <circle cx="35" cy="13" r="3.1" fill="currentColor" />
      <circle cx="44" cy="17" r="3.4" fill="currentColor" />
      <circle cx="50" cy="25" r="3.7" fill="currentColor" />
      <circle cx="51" cy="35" r="4.2" fill="currentColor" />
      <circle cx="14" cy="28" r="4.4" fill="currentColor" />
      <circle cx="18" cy="40" r="3.7" fill="currentColor" />
      <circle cx="28" cy="49" r="3.2" fill="currentColor" />
      <path
        d="M19 18c4.6-4.3 11-6.9 17.9-6.9C49.1 11.1 59 21 59 33.1c0 4.7-1.5 9.1-4.1 12.7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M42.2 42.2 32 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const iconUrlBySkillId: Record<string, string> = {
  java: "https://api.iconify.design/simple-icons/openjdk.svg",
  "spring-boot": "https://api.iconify.design/simple-icons/spring.svg",
  "jpa-hibernate": "https://api.iconify.design/simple-icons/hibernate.svg",
  nodejs: "https://api.iconify.design/simple-icons/nodedotjs.svg",
  express: "https://api.iconify.design/simple-icons/express.svg",
  mysql: "https://api.iconify.design/simple-icons/mysql.svg",
  oracle: "https://api.iconify.design/simple-icons/oracle.svg",
  postgresql: "https://api.iconify.design/simple-icons/postgresql.svg",
  redis: "https://api.iconify.design/simple-icons/redis.svg",
  elasticsearch: "https://api.iconify.design/simple-icons/elasticsearch.svg",
  docker: "https://api.iconify.design/simple-icons/docker.svg",
  git: "https://api.iconify.design/simple-icons/git.svg",
  aws: "https://api.iconify.design/simple-icons/amazonwebservices.svg",
  linux: "https://api.iconify.design/simple-icons/linux.svg",
  grafana: "https://api.iconify.design/simple-icons/grafana.svg",
  junit: "https://api.iconify.design/simple-icons/junit5.svg",
};

function MaskedBrandIcon({ skill }: { skill: SkillItem }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const iconUrl = iconUrlBySkillId[skill.id];
  const iconAdjustClass = iconAdjustments[skill.id] ?? "";

  useEffect(() => {
    if (!iconUrl) {
      setIsAvailable(false);
      return;
    }

    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setIsAvailable(true);
    };
    img.onerror = () => {
      if (!cancelled) setIsAvailable(false);
    };
    img.src = iconUrl;

    return () => {
      cancelled = true;
    };
  }, [iconUrl]);

  if (!iconUrl || !isAvailable) {
    return (
      <span className="text-[10px] font-semibold text-current">
        {skill.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`block h-5 w-5 bg-current ${iconAdjustClass}`}
      style={{
        WebkitMaskImage: `url(${iconUrl})`,
        maskImage: `url(${iconUrl})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function SkillIcon({ skill }: { skill: SkillItem }) {
  const accentClass = categoryBadgeClasses[skill.category];

  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClass}`}>
      <div className="relative flex h-6 w-6 items-center justify-center overflow-hidden">
        {skill.iconType === "spring-security" ? (
          <span className="flex h-6 w-6 items-center justify-center text-current">
            <SpringSecurityIcon />
          </span>
        ) : skill.iconType === "querydsl" ? (
          <span className="flex h-6 w-6 items-center justify-center text-current">
            <QueryDslIcon />
          </span>
        ) : (
          <MaskedBrandIcon skill={skill} />
        )}
      </div>
    </div>
  );
}

function LevelBar({ score, delay = 0 }: { score: number; delay?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors">
          {skillLevelLabels[score]}
        </span>
        <span className="shrink-0 text-xs font-medium text-muted-foreground transition-colors">{score}/5</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/[0.06] transition-colors dark:bg-white/[0.1]">
        <motion.div
          initial={{ width: 0, opacity: 0.9 }}
          animate={{ width: `${score * 20}%`, opacity: 1 }}
          transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-foreground dark:bg-white"
        />
      </div>
    </div>
  );
}

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("Backend");

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

  const filteredSkills = useMemo(() => skills.filter((skill) => skill.category === activeCategory), [activeCategory]);

  return (
    <section ref={sectionRef} className="py-24" data-testid="section-skills">
      <div
        className={`mb-12 flex items-center gap-4 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground" data-testid="text-skills-title">
          Skills
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div
        className={`transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Technical Stack</p>
            <p className="text-sm text-muted-foreground">다양한 기술을 활용하여 높은 가치의 서비스를 창출합니다.</p>
          </div>

          <div className="inline-flex w-full items-center gap-2 rounded-full bg-foreground/[0.04] p-1.5 transition-colors dark:bg-white/[0.06] md:w-auto">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "text-foreground dark:text-white" : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                  } md:flex-none`}
                  data-testid={`button-skills-category-${category}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="skills-active-tab"
                      className="absolute inset-0 rounded-full bg-background/90 dark:bg-white/[0.1]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="mb-6 flex flex-col gap-2 pb-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-semibold text-foreground" data-testid={`text-skills-category-${activeCategory}`}>
                {activeCategory}
              </h3>
              <p className="text-sm text-muted-foreground">{categoryDescriptions[activeCategory]}</p>
            </div>

            <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
              {filteredSkills.map((skill, index) => (
                <motion.article
                  key={skill.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  className="border-b border-border/70 py-7 transition-colors"
                >
                  <div className="mb-4 flex min-h-[48px] items-center gap-4">
                    <SkillIcon skill={skill} />

                    <div className="grid min-h-[48px] flex-1 content-center">
                      <p className="text-base font-semibold leading-none text-foreground">{skill.name}</p>
                      <span className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{skill.role}</span>
                    </div>
                  </div>

                  <div className="pl-[3.75rem]">
                    <LevelBar score={skill.score} delay={0.08 + index * 0.045} />
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
