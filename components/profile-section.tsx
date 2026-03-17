"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowDown, Github, Mail, Linkedin } from "lucide-react";

export function ProfileSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Toggle name every 10 seconds
    const nameInterval = setInterval(() => {
      setIsEnglish((prev) => !prev);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(nameInterval);
    };
  }, []);

  const scrollToContent = () => {
    const nextSection = sectionRef.current?.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100vh-7rem)] flex flex-col justify-between"
    >
      {/* Main hero content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="max-w-5xl w-full">
          {/* Overline label with enhanced visual */}
          <div
            className={`flex items-center gap-4 mb-10 transition-all duration-1000 delay-100 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="h-[2px] w-16 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-primary/80">
              Backend Developer
            </span>
          </div>

          {/* Name - Refined typography with text-reveal feel and auto-toggle */}
          <h1
            className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-foreground mb-8 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <span className="relative block leading-none h-[1.1em] overflow-hidden">
              <span 
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isEnglish 
                    ? "opacity-0 -translate-y-full" 
                    : "opacity-100 translate-y-0"
                }`}
              >
                {"이창중"}
              </span>
              <span 
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isEnglish 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-full"
                }`}
              >
                {"DEV-LEE"}
              </span>
            </span>
          </h1>

          {/* Tagline & Description - Clean & Focused */}
          <div className={`space-y-6 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-extralight leading-tight max-w-3xl">
              <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-8">{"빠른 서비스"}</span>
              {"를 설계하고 구현하는 가치를 믿습니다."}
            </p>

            <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed max-w-2xl font-light italic">
              {"성능 최적화와 안정적인 인프라를 통해 최상의 사용자 경험을 전달합니다. Spring Boot와 데이터베이스를 활용한 견고한 시스템 구축에 열정을 가지고 있습니다."}
            </p>
          </div>

          {/* Contact Actions - Unified & Minimalist */}
          <div
            className={`flex flex-wrap items-center gap-6 mt-12 transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <a
              href="mailto:ckdwnd9999@email.com"
              className="group flex items-center gap-3 text-foreground/70 hover:text-primary transition-all duration-300"
            >
              <div className="p-2 rounded-full border border-border group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium tracking-wide">Get in Touch</span>
            </a>
            
            <div className="h-4 w-px bg-border/60 mx-2 hidden sm:block" />

            <div className="flex items-center gap-5">
              <a
                href="https://github.com/DEV-Cheeze"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/dev-cheeze/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - Minimalist */}
      <div
        className={`flex justify-center pb-10 transition-all duration-1000 delay-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={scrollToContent}
          className="group flex flex-col items-center gap-3 text-muted-foreground/50 hover:text-primary transition-all"
        >
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Discover
          </span>
          <div className="relative h-12 w-[1px] bg-border overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-primary animate-scroll-down" />
          </div>
        </button>
      </div>
    </section>
  );
}
