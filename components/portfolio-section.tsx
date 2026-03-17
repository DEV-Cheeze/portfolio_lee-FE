"use client";

import { useRef, useEffect, useState } from "react";
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
  challenges: string;
  results: string;
}

const projects: Project[] = [
  {
    id: "1",
    title: "개인 포트폴리오 & 기술 블로그 - DEV LEE",
    description: "Spring Boot 기반의 고성능 API 서버",
    longDescription:
      "포트폴리오 및 개인 테크블로그입니다. 원활한 서비스 이용을 위해 Spring Boot 기반의 고성능 API 서버를 추구합니다. JPA 최적화, Docker 배포 등 최신 기술 스택을 활용하여 안정적이고 확장 가능한 서비스를 구축했습니다.",
    thumbnail: "https://lee-devlog-img.kro.kr/img/project/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-03-17%20173922.png",
    tags: ["Next.js", "Spring Boot", "JPA/Hibernate", "K6/Grafana", "Prometheus", "Docker", "CI/CD"],
    githubUrl: "https://github.com/DEV-Cheeze/portfolio_lee",
    liveUrl: "https://lee-devlog.kro.kr",
    period: "2026.03 - now",
    role: "개발 인원: 1명, FullStack 개발 (백엔드 중심), 배포 및 운영",
    responsibilities: [
      "Next.js를 활용한 프론트엔드 개발 및 UI/UX 개선 (AI 사용)",
      "Spring Boot 기반 RESTful API 설계 및 구현",
      "JPA/Hibernate를 활용한 데이터 모델링 및 쿼리 최적화 (N+1 문제 해결, 인덱스 튜닝, FULLTEXT 검색 구현)",
      "Spring Actuator, Prometheus, K6를 활용한 부하 테스트 시나리오 작성 및 Grafana 대시보드 구축",
      "Github Actions와 Docker Compose기반 배포 파이프라인 구축",
      "AWS EC2에 Docker 컨테이너로 배포 및 운영, CodeDeploy를 활용한 무중단 배포 구현 (Blue-Green 배포 전략 적용)",
      "CDN(CloudFront)을 활용한 S3 정적 자원 최적화 및 글로벌 배포 구현",
      "좋아요 동시성 문제 해결을 위한 exclusive lock 도입",
      "추후 QueryDSL 도입을 통한 안정적인 동적 쿼리 실행 계획",
      "FULLTEXT 검색 트래픽이 증가될 경우 Elasticsearch 도입 예정",
      "현재는 트래픽이 적어 단순 구조로 운영하지만, 향후 조회수/좋아요 집계는 캐시나 비동기 처리로 개선할 계획"
    ],
    challenges:
      "현재는 초기 버전으로 사용자 규모가 크지 않아 의미 있는 운영 지표는 많지 않지만, k6를 활용한 API 응답 시간 측정과 모니터링 지표 수집 환경을 구성해 향후 성능을 정량적으로 분석할 수 있도록 준비했습니다.\n"
      + "초기에는 트래픽 급증 시나리오를 예상하여 JPA 쿼리문 최적화를 시도하였습니다.",
    results:
      "부하 테스트 300명 동시 접속 시 평균 응답 시간 150ms 미만 달성 (최대 300ms)",
  },
  {
    id: "2",
    title: "네덜란드식 경매 플랫폼 - Windfall",
    description: "실시간 경매 시스템 및 결제 서비스",
    longDescription:
      "",
    thumbnail: "https://lee-devlog-img.kro.kr/img/project/e6d175f5-d03a-4c33-95ec-238197c262e7.png",
    tags: ["Spring Boot", "MySQL", "WebSocket(Stomp)", "AWS", "Docker", "CI/CD"],
    githubUrl: "https://github.com/prgrms-web-devcourse-final-project/WEB7_9_200OK_BE",
    liveUrl: "https://wind-fall.store/",
    period: "2025.12 - 2026.01",
    role: "개발 인원: 2명, 백엔드 개발 (마이페이지), CI/CD 구축",
    responsibilities: [
      "마이페이지 API 설계 및 구현 (주문 내역, 찜 목록, 리뷰 관리 등)",
      "CI/CD 파이프라인 구축 (Github Actions, AWS CodeDeploy, Blue-Green 배포 전략 적용)",
      "AWS EC2에 Docker Compose 컨테이너로 배포 및 운영",
      "JPA Native Query를 활용한 복잡한 데이터 조회 최적화",
    ],
    challenges:
      "JPA Native Query로 복잡한 데이터 조회 로직을 구현하는 과정에서 발생하는 N+1 문제와 조인으로 인한 성능 저하 문제를 해결하기 위해 쿼리 분산 처리와 인덱스 최적화 전략을 적용했습니다. 또한 배포 시 서비스 중단 없이 새로운 버전으로 전환하기 위해 Blue-Green 배포 전략을 도입하여 배포 실패 시 빠르게 롤백할 수 있도록 준비했습니다.",
    results: 
      "최대 7개의 조인 테이블 조회에서도 평균 응답 시간 200ms 미만 달성 (인덱스 미적용), Blue-Green 배포 도입으로 무중단 배포 구현 (배포 실패 시 롤백 시간 1분 이내)",
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.challenges}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {"성과"}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.results}
              </p>
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
