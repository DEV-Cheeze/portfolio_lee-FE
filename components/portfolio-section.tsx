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
    title: "대규모 트래픽 처리 API 서버",
    description: "일 1000만 요청을 처리하는 고성능 REST API 서버",
    longDescription:
      "Spring Boot 기반의 고성능 API 서버로, 캐싱 전략과 비동기 처리를 통해 대규모 트래픽을 안정적으로 처리합니다. Redis 클러스터와 메시지 큐를 활용한 분산 처리 아키텍처를 구축했습니다.",
    thumbnail: "/placeholder.svg?height=400&width=600",
    tags: ["Spring Boot", "Redis", "Kafka", "PostgreSQL", "Docker"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    period: "2024.01 - 2024.06",
    role: "백엔드 리드",
    responsibilities: [
      "Spring Boot 기반 RESTful API 설계 및 구현",
      "Redis 클러스터를 활용한 캐싱 레이어 구축",
      "Kafka를 이용한 비동기 이벤트 처리 시스템 설계",
      "JPA 쿼리 최적화 및 인덱스 튜닝으로 응답 시간 70% 개선",
      "Docker/Kubernetes 기반 배포 파이프라인 구축",
    ],
    challenges:
      "피크 시간대 급증하는 트래픽으로 인한 서버 응답 지연 문제를 Redis 캐싱과 Kafka 기반 비동기 처리로 해결. 평균 응답 시간을 500ms에서 50ms로 단축했습니다.",
    results:
      "일 평균 1000만 API 요청을 99.9% 가용성으로 처리, 서버 비용 40% 절감",
  },
  {
    id: "2",
    title: "마이크로서비스 결제 시스템",
    description: "MSA 기반의 안정적인 결제 처리 플랫폼",
    longDescription:
      "여러 PG사와 연동되는 통합 결제 시스템입니다. 분산 트랜잭션 관리, 장애 복구 메커니즘, 정산 자동화 기능을 구현했습니다. Spring Cloud 기반 마이크로서비스 아키텍처를 적용했습니다.",
    thumbnail: "/placeholder.svg?height=400&width=600",
    tags: ["Spring Cloud", "MySQL", "RabbitMQ", "AWS", "Kubernetes"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    period: "2023.06 - 2023.12",
    role: "백엔드 개발",
    responsibilities: [
      "결제/정산 마이크로서비스 설계 및 개발",
      "Saga 패턴을 적용한 분산 트랜잭션 관리",
      "다중 PG사 연동을 위한 어댑터 패턴 구현",
      "결제 실패 시 자동 재시도 및 보상 트랜잭션 로직 구현",
      "월별 정산 배치 시스템 개발",
    ],
    challenges:
      "분산 환경에서의 트랜잭션 일관성 문제를 Saga 패턴과 이벤트 소싱으로 해결. 결제 성공률을 99.5%에서 99.95%로 향상시켰습니다.",
    results: "월 거래액 50억 원 처리, 결제 오류율 0.05% 미만 달성",
  },
  {
    id: "3",
    title: "실시간 데이터 파이프라인",
    description: "대용량 로그 수집 및 실시간 분석 시스템",
    longDescription:
      "일 10TB 이상의 로그 데이터를 실시간으로 수집, 처리, 분석하는 데이터 파이프라인입니다. Elasticsearch를 활용한 검색 최적화와 Grafana 대시보드를 통한 모니터링 시스템을 구축했습니다.",
    thumbnail: "/placeholder.svg?height=400&width=600",
    tags: ["Kafka", "Elasticsearch", "Logstash", "Spring Batch", "Grafana"],
    githubUrl: "https://github.com",
    period: "2023.01 - 2023.05",
    role: "데이터 엔지니어",
    responsibilities: [
      "Kafka Connect를 활용한 로그 수집 파이프라인 구축",
      "Logstash 필터링 및 데이터 정규화 로직 개발",
      "Elasticsearch 인덱스 설계 및 검색 쿼리 최적화",
      "Spring Batch를 활용한 일별 집계 배치 시스템 구현",
      "Grafana 기반 실시간 모니터링 대시보드 구축",
    ],
    challenges:
      "급증하는 로그 데이터로 인한 Elasticsearch 클러스터 부하 문제를 인덱스 샤딩 전략과 ILM 정책으로 해결했습니다.",
    results:
      "로그 검색 시간 90% 단축, 장애 탐지 시간 평균 30초 이내 달성",
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
