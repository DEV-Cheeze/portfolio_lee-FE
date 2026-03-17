"use client";

import { useRef, useEffect, useState } from "react";
import { GraduationCap, FolderGit2, Mail, Github, Linkedin } from "lucide-react";

export function InfoCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section ref={sectionRef} className="py-24">
      {/* Section header */}
      <div
        className={`flex items-center gap-4 mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          About
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Education Card */}
        <div
          className={`group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{"학력"}</h3>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-primary/20 pl-4 group-hover:border-primary/40 transition-colors">
              <p className="text-xs text-muted-foreground font-medium tracking-wide">2019 - 2025</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{"대전보건대학교"}</p>
              <p className="text-xs text-muted-foreground">{"컴퓨터정보과"}</p>
            </div>
            <div className="border-l-2 border-primary/20 pl-4 group-hover:border-primary/40 transition-colors">
              <p className="text-xs text-muted-foreground font-medium tracking-wide">2016 - 2019</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{"두루고등학교"}</p>
              <p className="text-xs text-muted-foreground">{"자연계열"}</p>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div
          className={`group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{"프로젝트 연혁"}</h3>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-primary/20 pl-4 group-hover:border-primary/40 transition-colors">
              <p className="text-xs text-muted-foreground font-medium tracking-wide">2026</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{"포트폴리오 블로그 웹사이트 - Portfolio Lee"}</p>
              <p className="text-xs text-muted-foreground">Spring Boot, MySQL</p>
            </div>
            <div className="border-l-2 border-primary/20 pl-4 group-hover:border-primary/40 transition-colors">
              <p className="text-xs text-muted-foreground font-medium tracking-wide">2025</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{"네덜란드식 경매 플랫폼 - Windfall"}</p>
              <p className="text-xs text-muted-foreground">Spring Boot, WebSocket, MySQL</p>
            </div>
            <div className="border-l-2 border-primary/20 pl-4 group-hover:border-primary/40 transition-colors">
              <p className="text-xs text-muted-foreground font-medium tracking-wide">2023</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{"여행지 추천 챗봇 AI - Travey"}</p>
              <p className="text-xs text-muted-foreground">Node.js, express.js</p>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div
          className={`group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{"연락처"}</h3>
          </div>
          <div className="space-y-3">
            <a
              href="mailto:ckdwnd9999@email.com"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group/link"
            >
              <Mail className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover/link:text-foreground transition-colors">
                ckdwnd9999@email.com
              </span>
            </a>
            <a
              href="https://github.com/DEV-Cheeze"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group/link"
            >
              <Github className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover/link:text-foreground transition-colors">
                github.com/DEV-Cheeze
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/dev-cheeze/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group/link"
            >
              <Linkedin className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover/link:text-foreground transition-colors">
                linkedin.com/in/dev-cheeze
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
