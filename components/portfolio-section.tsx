"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ExternalLink, Github, ChevronRight, X, ArrowUpRight } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  period: string;
  role: string;
  responsibilities: string[];
  challenges: string | string[];
  results: string | ReactNode[];
  performanceNote?: string;
}

const projects: Project[] = [
  {
    id: "1",
    title: "개인 기술 블로그·포트폴리오",
    description: "개인 기술 블로그·포트폴리오 서비스",
    longDescription: "",
    thumbnail: "https://lee-devlog-img.kro.kr/img/project/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-03-17%20173922.png",
    tags: ["Next.js", "Spring Boot", "JPA/Hibernate", "K6/Grafana", "Prometheus", "Docker", "CI/CD"],
    githubUrl: "https://github.com/DEV-Cheeze/portfolio_lee",
    liveUrl: "https://lee-devlog.kro.kr",
    period: "2026.03 - now",
    role: "개발 인원: 1명, FullStack 개발 (백엔드 중심), 배포 및 운영",
    responsibilities: [
      "게시글 작성·임시저장·발행, S3 이미지 업로드 및 CloudFront 제공 기능 개발",
      "Spring Security·JWT 기반 인증과 Refresh Token Rotation 구현",
      "방문자·좋아요·댓글 통계 집계 및 관리자 대시보드 개발",
      "AWS·Docker 기반 배포와 Blue/Green 전환·롤백, 모니터링 환경을 1인으로 구축",
    ],
    challenges: [
      "게시글보다 이미지가 먼저 업로드되는 흐름을 고려해 임시저장·발행 상태를 분리하고, 발행 시 본문과 S3 이미지를 연결했습니다.",
      "토큰 재발급 시 기존 Refresh Token을 무효화하고, 만료시간에 맞춰 인증 정보의 저장·갱신·폐기 주기를 관리했습니다.",
      "통계 집계를 이벤트와 비동기 리스너로 분리해 집계 지연·예외가 사용자 요청에 전파되지 않도록 구성했습니다.",
    ],
    results: [
      "게시글·이미지·인증 정보의 생명주기를 고려한 개인 서비스 구현",
      "신규 컨테이너 헬스체크 후 트래픽 전환 및 기존 컨테이너로 롤백할 수 있는 배포 경로 구축",
      "Actuator·Prometheus·Grafana를 연동해 API 응답시간과 서비스 상태를 관측할 수 있는 운영 환경 구성",
    ],
  },
  {
    id: "2",
    title: "WindFall — 경매 기반 중고 거래 플랫폼",
    description: "경매 기반 중고 거래 플랫폼",
    longDescription:
      "",
    thumbnail: "https://lee-devlog-img.kro.kr/img/project/e6d175f5-d03a-4c33-95ec-238197c262e7.png",
    tags: ["Spring Boot", "MySQL", "WebSocket(Stomp)", "AWS", "Docker", "CI/CD"],
    githubUrl: "https://github.com/prgrms-web-devcourse-final-project/WEB7_9_200OK_BE",
    liveUrl: "https://wind-fall.store/",
    period: "2025.12 - 2026.01",
    role: "개발 인원: 6명, 백엔드 개발 (마이페이지), CI/CD 구축, 성능 개선 및 장애 대응",
    responsibilities: [
      "마이페이지 API 설계 및 구현: 구매·판매 내역, 찜, 최근 본 경매, 알림",
      "리뷰 작성 기능 구현: 구매확정 여부, 작성 권한, 중복 작성 검증",
      "GitHub Actions·CodeDeploy·Docker Compose·Nginx 기반 Blue/Green 배포 파이프라인 구축",
      "프로젝트 종료 후 SQL·인덱스 최적화, Redis 캐싱·장애 대응, 경매 갱신 스케줄러 개선을 개인적으로 진행",
    ],
    challenges: [
      "상세 조회 부하에서 발생한 커넥션 풀 포화를 분석하고, 대표 이미지 조회 범위·JOIN 구조·인덱스를 개선했습니다. 반복 조회되는 판매자 정보에는 Redis 캐시를 적용했습니다.",
      "Redis 장애 시 Timeout 대기가 누적되는 문제를 DB 대체 조회와 Circuit Breaker로 개선했습니다.",
      "경매별 UPDATE·트랜잭션 커밋을 2개의 Bulk Update로 변경했습니다. 이후 발생한 비동기 작업 집중 제출 문제는 커밋 후 변경 목록을 하나의 작업으로 제출하도록 개선했습니다.",
    ],
    results: [
      <>
        판매자 상세 평균 응답시간 <strong>2,398.18 → 1.47ms</strong>, <strong>99.94% 단축</strong>
      </>,
      <>
        경매 상세 평균 응답시간 <strong>2,359.87 → 9.39ms</strong>, <strong>99.60% 단축</strong>
      </>,
      <>
        SQL·인덱스 개선 후 전체 HTTP 처리량 <strong>484.48 → 799.93req/s</strong>, <strong>65.11% 증가</strong>
      </>,
      <>
        경매 2만 건 평균 DB 갱신시간 <strong>88.9790 → 0.1879초</strong>, <strong>99.79% 단축</strong> 및 기존 방식과 처리 결과 일치 검증
      </>,
      <>
        Redis 중단을 포함한 실험에서 HTTP 실패율 <strong>13.69% → 0%</strong>, 개선 후 <strong>4회 모두 HTTP 실패·실행 누락 0건</strong>
      </>,
    ],
    performanceNote:
      "※ 성능 수치는 조건별 4회 측정 평균입니다. 상세 조회는 두 API 합계 목표 800req/s 조건이며, Redis 장애 실험은 정상 1분·중단 2분·복구 1분의 전체 구간을 측정했습니다.",
  },
];

function ProjectModal({
  project,
  isOpen,
  onClose,
}: {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        <div className="relative h-48 md:h-56 overflow-hidden rounded-t-2xl">
          <Image
            src={project.thumbnail || "/placeholder.svg"}
            alt={project.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>

        <div className="p-6 md:p-8 -mt-12 relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-primary font-medium">
              {project.period}
            </span>
            <span className="text-muted-foreground/40">{"/"}</span>
            <span className="text-sm text-muted-foreground">
              {project.role}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
            {project.title}
          </h3>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {project.longDescription}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-8">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {"담당 역할"}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {project.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {"해결한 문제"}
              </h4>
              {Array.isArray(project.challenges) ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {project.challenges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.challenges}
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {"성과"}
              </h4>
              {Array.isArray(project.results) ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {project.results.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.results}
                </p>
              )}
              {project.performanceNote && (
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  {project.performanceNote}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-border">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  isVisible,
  onOpen,
}: {
  project: Project;
  index: number;
  isVisible: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group w-full text-left rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-700 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={project.thumbnail || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-foreground/90 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-background" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary">{project.period}</span>
          <span className="text-muted-foreground/30">{"/"}</span>
          <span className="text-xs text-muted-foreground">{project.role}</span>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-muted-foreground">
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function PortfolioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
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
          Projects
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            isVisible={isVisible}
            onOpen={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* View More */}
      <div
        className={`flex justify-center mt-12 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <button
          type="button"
          className="group flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
        >
          {"더 많은 프로젝트 보기"}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}
