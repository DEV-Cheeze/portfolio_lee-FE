"use client";

import { API_BASE_URL } from "@/lib/api";
import { useEffect, useMemo, useState, type ComponentType, type ReactElement, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gauge,
  Heart,
  MessageSquare,
  Search,
  ShieldAlert,
  TerminalSquare,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adminCategoryStats,
  analyticsByRange,
  customRangeBundle,
  endpointTraffic,
  managedComments,
  managedPosts,
  members,
  performanceCards,
  rangeLabels,
  warnLogs,
  type EndpointRow,
  type RangePreset,
  type TimePoint,
} from "@/lib/admin-mock";

const COLORS = {
  visitors: "#3b82f6",
  views: "#8b5cf6",
  comments: "#10b981",
  likes: "#f59e0b",
  response: "#3b82f6",
  error: "#ef4444",
  requests: "#06b6d4",
};


const PERFORMANCE_PRESET_OPTIONS: Array<{ key: Exclude<PerformancePreset, "custom">; label: string; minutes: number }> = [
  { key: "5m", label: "5분", minutes: 5 },
  { key: "10m", label: "10분", minutes: 10 },
  { key: "15m", label: "15분", minutes: 15 },
  { key: "1h", label: "1시간", minutes: 60 },
  { key: "2h", label: "2시간", minutes: 120 },
  { key: "3h", label: "3시간", minutes: 180 },
  { key: "4h", label: "4시간", minutes: 240 },
  { key: "8h", label: "8시간", minutes: 480 },
  { key: "12h", label: "12시간", minutes: 720 },
  { key: "24h", label: "24시간", minutes: 1440 },
];

type PerformancePreset = "5m" | "10m" | "15m" | "1h" | "2h" | "3h" | "4h" | "8h" | "12h" | "24h" | "custom";
type ChartTimePoint = TimePoint & {
  responseMs: number;
  previousResponseMs: number;
  prevRangeVisitors: number;
  prevRangeViews: number;
  prevRangeComments: number;
  prevRangeLikes: number;
  prevRangeResponseMs: number;
};

type VisitorFlowPoint = {
  timestamp?: string;
  label: string;
  fullLabel?: string;
  visitors: number;
  views: number;
  prevRangeVisitors: number;
  prevRangeViews: number;
  rangeLabel?: string;
  extraAggregate?: boolean;
  additionalMessage?: string;
};

type ChartDotProps = {
  cx?: number;
  cy?: number;
  payload?: unknown;
  index?: number;
};

type PerformancePoint = {
  label: string;
  fullLabel: string;
  response: number;
  requests: number;
  error: number;
  previousResponse: number;
  previousRequests: number;
  previousError: number;
  prevRangeResponse: number;
  prevRangeRequests: number;
  prevRangeError: number;
};

type EndpointHistoryPoint = {
  label: string;
  fullLabel: string;
  response: number;
  requests: number;
  error: number;
  prevRangeResponse: number;
  prevRangeRequests: number;
  prevRangeError: number;
};

type DashboardMetricKey = "visitors" | "comments" | "likes" | "responseMs";
type DashboardGraphType = "visitor" | "comment" | "like" | "api-response";

type DashboardSummaryMetric = {
  avgCurrent: number | null;
  avgDelta: number | null;
};

type DashboardSummaryData = {
  visitors: DashboardSummaryMetric;
  comments: DashboardSummaryMetric;
  likes: DashboardSummaryMetric;
  responseMs: DashboardSummaryMetric;
};

type OverviewGraphPoint = {
  timestamp: string;
  label: string;
  fullLabel: string;
  value: number | null;
  lineValue: number | null;
  pointValue: number;
  displayValue: number;
  observed: boolean;
  delta: number | null;
  rangeLabel?: string;
  extraAggregate?: boolean;
  additionalMessage?: string;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-[28px] border border-border/70 bg-card/80 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)] backdrop-blur-sm", className)}>{children}</div>;
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
      </div>
    </div>
  );
}

function CategoryTab({
  active,
  label,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-2xl border px-4 py-4 text-left transition-colors",
        active ? "border-primary/30 bg-primary/10 text-foreground" : "border-border/70 bg-card/70 text-muted-foreground hover:border-primary/20 hover:text-foreground"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className={cx("flex h-10 w-10 items-center justify-center rounded-2xl border", active ? "border-primary/20 bg-primary/12 text-primary" : "border-border/60 bg-background/70 text-muted-foreground")}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {active ? <ChevronRight className="h-4 w-4 text-primary" /> : null}
      </div>
      <p className="mt-4 text-sm font-semibold">{label}</p>
    </button>
  );
}

function SideTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
        active ? "border-primary/30 bg-primary/10 text-foreground" : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  active = false,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <Surface className={cx("p-5 transition-colors", active ? "border-primary/30 bg-primary/10" : "") }>
      <div className="mb-6 flex items-center justify-between">
        <div className={cx("flex h-11 w-11 items-center justify-center rounded-2xl border text-primary", active ? "border-primary/25 bg-primary/14" : "border-primary/15 bg-primary/10")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {hint ? <div className="mt-2 text-sm">{hint}</div> : null}
    </Surface>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

function DeltaText({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  const delta = current - previous;
  if (delta === 0) return <p className="text-xs font-medium text-muted-foreground">0{suffix}</p>;
  const positive = delta > 0;
  return (
    <p className={cx("text-xs font-semibold", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
      {positive ? "+" : "-"}
      {Math.abs(delta).toLocaleString()}
      {suffix}
    </p>
  );
}

function tinyValueColor(ms: number) {
  if (ms <= 200) return "text-emerald-600 dark:text-emerald-400";
  if (ms <= 500) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function methodTone(method: string) {
  if (method === "GET") return "border-emerald-500/20 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400";
  if (method === "POST") return "border-sky-500/20 bg-sky-500/8 text-sky-600 dark:text-sky-400";
  if (method === "PUT") return "border-amber-500/20 bg-amber-500/8 text-amber-600 dark:text-amber-400";
  if (method === "PATCH") return "border-violet-500/20 bg-violet-500/8 text-violet-600 dark:text-violet-400";
  if (method === "DELETE") return "border-rose-500/20 bg-rose-500/8 text-rose-600 dark:text-rose-400";
  return "border-border/70 bg-background/70 text-muted-foreground";
}

function MethodBadge({ method, compact = false }: { method: string; compact?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-md border font-medium uppercase leading-none",
        compact ? "h-[18px] px-1.5 text-[9px] tracking-[0.04em]" : "h-5 px-1.5 text-[10px] tracking-[0.04em]",
        methodTone(method)
      )}
    >
      {method}
    </span>
  );
}

function EndpointText({ path, wrap = false }: { path: string; wrap?: boolean }) {
  return (
    <span className={cx(wrap ? "break-all whitespace-normal" : "truncate", "font-mono text-[12px] font-medium text-primary/85 md:text-[13px] dark:text-primary/80")}>{path}</span>
  );
}

function formatLabel(start: Date, index: number, total: number) {
  const current = new Date(start);
  current.setDate(start.getDate() + index);
  if (total <= 7) return `${String(current.getMonth() + 1).padStart(2, "0")}/${String(current.getDate()).padStart(2, "0")}`;
  return `${current.getMonth() + 1}/${current.getDate()}`;
}

function summarizeHistory(history: TimePoint[]) {
  return history.reduce(
    (acc, point) => {
      acc.currentVisitors += point.visitors;
      acc.previousVisitors += point.previousVisitors;
      acc.currentComments += point.comments;
      acc.previousComments += point.previousComments;
      acc.currentLikes += point.likes;
      acc.previousLikes += point.previousLikes;
      acc.currentViews += point.views;
      acc.previousViews += point.previousViews;
      return acc;
    },
    {
      currentVisitors: 0,
      previousVisitors: 0,
      currentComments: 0,
      previousComments: 0,
      currentLikes: 0,
      previousLikes: 0,
      currentViews: 0,
      previousViews: 0,
    }
  );
}

function buildChartHistory(history: TimePoint[], avgResponseMs: number): ChartTimePoint[] {
  const responseSeries = history.map((point, index) => {
    const loadFactor = point.visitors * 0.9 + point.comments * 5 + point.likes * 2 + point.views * 0.18;
    const previousLoadFactor = point.previousVisitors * 0.9 + point.previousComments * 5 + point.previousLikes * 2 + point.previousViews * 0.18;
    const responseMs = Math.max(60, Math.round(avgResponseMs + (loadFactor - 90) * 0.55 + Math.sin(index * 0.8) * 10));
    const previousResponseMs = Math.max(50, Math.round(avgResponseMs * 0.94 + (previousLoadFactor - 82) * 0.5 + Math.cos(index * 0.6) * 8));
    return { responseMs, previousResponseMs };
  });

  return history.map((point, index) => ({
    ...point,
    responseMs: responseSeries[index].responseMs,
    previousResponseMs: responseSeries[index].previousResponseMs,
    prevRangeVisitors: index === 0 ? point.visitors : history[index - 1].visitors,
    prevRangeViews: index === 0 ? point.views : history[index - 1].views,
    prevRangeComments: index === 0 ? point.comments : history[index - 1].comments,
    prevRangeLikes: index === 0 ? point.likes : history[index - 1].likes,
    prevRangeResponseMs: index === 0 ? responseSeries[index].responseMs : responseSeries[index - 1].responseMs,
  }));
}

function formatRangeLabel(startValue: string, endValue: string, presetLabel?: string) {
  if (presetLabel && presetLabel !== "직접 선택") return presetLabel;
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "직접 선택";
  const startText = `${start.getMonth() + 1}/${start.getDate()}`;
  const endText = `${end.getMonth() + 1}/${end.getDate()}`;
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay ? startText : `${startText} - ${endText}`;
}

function buildCustomBundle(startStr: string, endStr: string) {
  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return customRangeBundle;

  const dayCount = Math.max(1, Math.min(31, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1));
  const history: TimePoint[] = Array.from({ length: dayCount }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.9);
    const trend = Math.cos((index + 1) * 0.55);
    const weekendBoost = index % 7 === 5 || index % 7 === 6 ? -8 : 6;
    const visitors = Math.max(18, Math.round(72 + index * 4 + wave * 14 + weekendBoost));
    const views = Math.max(24, Math.round(visitors * 1.72 + trend * 13));
    const comments = Math.max(2, Math.round(visitors * 0.11 + wave * 1.8));
    const likes = Math.max(3, Math.round(visitors * 0.24 + trend * 2.6));
    const previousVisitors = Math.max(10, Math.round(visitors * (0.88 + ((index + 2) % 3) * 0.02)));
    const previousViews = Math.max(14, Math.round(views * (0.9 + (index % 4) * 0.015)));
    const previousComments = Math.max(1, Math.round(comments * (0.82 + (index % 3) * 0.04)));
    const previousLikes = Math.max(1, Math.round(likes * (0.85 + (index % 5) * 0.02)));
    return {
      label: formatLabel(start, index, dayCount),
      visitors,
      views,
      comments,
      likes,
      previousVisitors,
      previousViews,
      previousComments,
      previousLikes,
    };
  });

  const totals = summarizeHistory(history);
  const summary = {
    visitors: totals.currentVisitors,
    comments: totals.currentComments,
    likes: totals.currentLikes,
    avgResponseMs: Math.max(118, Math.min(246, 138 + dayCount * 2)),
    requestsLastFiveMin: 120 + dayCount * 24,
  };

  const scale = dayCount / 7;
  const topPosts = customRangeBundle.topPosts.map((post, index) => ({
    ...post,
    views: Math.round(post.views * Math.max(0.45, scale * (1.04 - index * 0.018))),
  }));
  const visitorsRank = customRangeBundle.visitorsRank.map((visitor, index) => ({
    ...visitor,
    visits: Math.max(4, Math.round(visitor.visits * Math.max(0.5, scale * (1.02 - index * 0.03)))),
  }));

  return { summary, history, topPosts, visitorsRank };
}

function setPresetDates(preset: Exclude<RangePreset, "custom">) {
  return resolvePresetDates(preset);
}

function setPerformancePresetDates(preset: Exclude<PerformancePreset, "custom">, customMinutes?: number) {
  const end = new Date("2026-03-27T12:00:00");
  const start = new Date(end);
  const presetMinutes = PERFORMANCE_PRESET_OPTIONS.find((item) => item.key === preset)?.minutes ?? 15;
  const minutes = preset === "1h" && typeof customMinutes === "number"
    ? Math.max(1, Math.min(1440, customMinutes))
    : presetMinutes;
  start.setMinutes(end.getMinutes() - minutes);
  return {
    start: toDateTimeLocal(start),
    end: toDateTimeLocal(end),
  };
}

function performancePresetLabel(preset: PerformancePreset, customMinutes: number) {
  if (preset === "custom") return `직접 설정 · ${customMinutes}분`;
  return PERFORMANCE_PRESET_OPTIONS.find((item) => item.key === preset)?.label ?? "15분";
}

function toDateTimeLocal(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const date = `${value.getDate()}`.padStart(2, "0");
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${date}T${hours}:${minutes}`;
}


const OVERVIEW_TYPE_MAP: Record<OverviewMetric, DashboardGraphType> = {
  visitors: "visitor",
  comments: "comment",
  likes: "like",
  responseMs: "api-response",
};

const OVERVIEW_SUMMARY_EMPTY: DashboardSummaryData = {
  visitors: { avgCurrent: null, avgDelta: null },
  comments: { avgCurrent: null, avgDelta: null },
  likes: { avgCurrent: null, avgDelta: null },
  responseMs: { avgCurrent: null, avgDelta: null },
};

function getTodayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const date = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function startOfWeek(value: Date) {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function resolvePresetDates(preset: Exclude<RangePreset, "custom">) {
  const today = getTodayDateOnly();
  if (preset === "today") {
    return { start: formatDateInputValue(today), end: formatDateInputValue(today) };
  }
  if (preset === "week") {
    return { start: formatDateInputValue(startOfWeek(today)), end: formatDateInputValue(today) };
  }
  return { start: formatDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)), end: formatDateInputValue(today) };
}

function clampDateRange(startValue: string, endValue: string) {
  const today = getTodayDateOnly();
  const start = new Date(`${startValue}T00:00:00`);
  const rawEnd = new Date(`${endValue}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(rawEnd.getTime())) return null;
  const maxEnd = new Date(start);
  maxEnd.setDate(maxEnd.getDate() + 30);
  const clippedEnd = new Date(Math.min(rawEnd.getTime(), today.getTime(), maxEnd.getTime()));
  if (start > clippedEnd) return null;
  return { start, end: clippedEnd };
}

function serializeDayStart(value: Date) {
  return `${formatDateInputValue(value)} 00:00:00`;
}

function buildSummaryParams(preset: RangePreset, startValue: string, endValue: string) {
  const params = new URLSearchParams();
  if (preset === "today") params.set("timeline", "today");
  else if (preset === "week") params.set("timeline", "this_week");
  else if (preset === "month") params.set("timeline", "this_month");
  else {
    const range = clampDateRange(startValue, endValue);
    if (!range) return null;
    params.set("start", serializeDayStart(range.start));
    params.set("end", serializeDayStart(range.end));
  }
  return params;
}

function dashboardMetricUnit(metric: DashboardMetricKey) {
  if (metric === "responseMs") return "ms";
  if (metric === "visitors") return "명";
  return "건";
}

function formatDashboardMetricValue(metric: DashboardMetricKey, value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  return `${Math.round(value).toLocaleString()}${dashboardMetricUnit(metric)}`;
}

function formatDashboardDelta(metric: DashboardMetricKey, value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  if (value === 0) return `0${dashboardMetricUnit(metric)}`;
  return `${value > 0 ? "+" : "-"}${Math.abs(Math.round(value)).toLocaleString()}${dashboardMetricUnit(metric)}`;
}

function parseApiDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(value.replace("T", " ") + ":00");
}

function formatGraphTickLabel(date: Date, hourly: boolean) {
  if (hourly) return `${String(date.getHours()).padStart(2, "0")}:00`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatGraphFullLabel(date: Date, hourly: boolean) {
  if (hourly) return `${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, "0")}:00`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function differenceInCalendarDays(start: Date, end: Date) {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

function endOfDisplayedRange(preset: RangePreset, startValue: string, endValue: string) {
  const today = getTodayDateOnly();
  if (preset === "today" || preset === "week" || preset === "month") return today;
  const range = clampDateRange(startValue, endValue);
  return range?.end ?? today;
}

function buildMonthRangeLabel(current: Date, next: Date | null, finalEnd: Date) {
  const start = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const tentativeEnd = next ? new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1) : finalEnd;
  const end = tentativeEnd > finalEnd ? finalEnd : tentativeEnd;
  const dayLength = differenceInCalendarDays(start, end) + 1;
  const weekNumber = Math.floor((start.getDate() - 1) / 7) + 1;
  return {
    weekLabel: `${weekNumber}주차`,
    rangeLabel: `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`,
    extraAggregate: dayLength < 7,
  };
}

function transformOverviewGraphData(metric: OverviewMetric, payload: Record<string, number | null>, preset: RangePreset, startValue: string, endValue: string): OverviewGraphPoint[] {
  const entries = Object.entries(payload)
    .map(([timestamp, value]) => ({ timestamp, value, date: parseApiDate(timestamp) }))
    .filter((entry) => !Number.isNaN(entry.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const displayEnd = endOfDisplayedRange(preset, startValue, endValue);
  const filtered = entries.filter((entry) => entry.date.getTime() <= displayEnd.getTime() + 86399999);
  const hourly = filtered.length > 1 && differenceInCalendarDays(filtered[0].date, filtered[1].date) === 0;

  return filtered.map((entry, index) => {
    const previous = filtered[index - 1];
    const observed = entry.value !== null;
    const normalizedValue = metric === "responseMs" ? entry.value : entry.value === null ? 0 : entry.value;
    const previousNormalized = metric === "responseMs" ? previous?.value ?? null : previous ? (previous.value === null ? 0 : Number(previous.value)) : null;
    const delta = metric === "responseMs" ? (observed && previous && previous.value !== null ? Number(entry.value) - Number(previous.value) : null) : (previous ? Number(normalizedValue ?? 0) - Number(previousNormalized ?? 0) : null);
    const lineValue = metric === "responseMs" ? entry.value : normalizedValue;
    const pointValue = normalizedValue ?? 0;
    const monthRange = preset === "month" ? buildMonthRangeLabel(entry.date, filtered[index + 1]?.date ?? null, displayEnd) : null;
    return {
      timestamp: entry.timestamp,
      label: monthRange?.weekLabel ?? formatGraphTickLabel(entry.date, hourly),
      fullLabel: formatGraphFullLabel(entry.date, hourly),
      value: normalizedValue,
      lineValue,
      pointValue,
      displayValue: pointValue,
      observed,
      delta,
      rangeLabel: monthRange?.rangeLabel,
      extraAggregate: monthRange?.extraAggregate,
      additionalMessage: monthRange?.extraAggregate ? "추가 집계" : undefined,
    };
  });
}

function readNullableNumber(source: unknown, keys: string[]) {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value === null) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  }
  return null;
}

function normalizeMeasuredValue(value: number | null) {
  return value === null || Number.isNaN(value) ? 0 : value;
}

function transformVisitorFlowData(payload: unknown, preset: RangePreset, startValue: string, endValue: string): VisitorFlowPoint[] {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const timeStamps = root.timeStamps ?? root.timestamps ?? payload;
  const visitorSeries = root.visitor ?? root.visitors;
  const viewSeries = root.view ?? root.views;
  const visitorTimeStamps = visitorSeries && typeof visitorSeries === "object" ? ((visitorSeries as Record<string, unknown>).timeStamps ?? (visitorSeries as Record<string, unknown>).timestamps ?? visitorSeries) : null;
  const viewTimeStamps = viewSeries && typeof viewSeries === "object" ? ((viewSeries as Record<string, unknown>).timeStamps ?? (viewSeries as Record<string, unknown>).timestamps ?? viewSeries) : null;
  const hasSeparateSeries = !root.timeStamps && !root.timestamps && visitorTimeStamps && viewTimeStamps && typeof visitorTimeStamps === "object" && typeof viewTimeStamps === "object";
  const rawEntries = hasSeparateSeries
    ? Array.from(new Set([...Object.keys(visitorTimeStamps as Record<string, unknown>), ...Object.keys(viewTimeStamps as Record<string, unknown>)]))
        .map((timestamp) => ({
          timestamp,
          value: {
            visitor: (visitorTimeStamps as Record<string, unknown>)[timestamp],
            view: (viewTimeStamps as Record<string, unknown>)[timestamp],
          },
        }))
    : Array.isArray(timeStamps)
    ? timeStamps.map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          timestamp: String(record.timestamp ?? record.timeStamp ?? record.dateTime ?? record.date ?? ""),
          value: record,
        };
      })
    : Object.entries((timeStamps && typeof timeStamps === "object" ? timeStamps : {}) as Record<string, unknown>).map(([timestamp, value]) => ({ timestamp, value }));

  const entries = rawEntries
    .map(({ timestamp, value }) => ({ timestamp, value, date: parseApiDate(timestamp) }))
    .filter((entry) => entry.timestamp && !Number.isNaN(entry.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const displayEnd = endOfDisplayedRange(preset, startValue, endValue);
  const filtered = entries.filter((entry) => entry.date.getTime() <= displayEnd.getTime() + 86399999);
  const hourly = filtered.length > 1 && differenceInCalendarDays(filtered[0].date, filtered[1].date) === 0;

  return filtered.map((entry, index) => {
    const previous = filtered[index - 1];
    const visitors = normalizeMeasuredValue(readNullableNumber(entry.value, ["visitor", "visitors", "visitorCount", "visitorCnt"]));
    const views = normalizeMeasuredValue(readNullableNumber(entry.value, ["view", "views", "viewCount", "viewCnt", "pageView", "pageViews"]));
    const previousVisitors = previous ? normalizeMeasuredValue(readNullableNumber(previous.value, ["visitor", "visitors", "visitorCount", "visitorCnt"])) : visitors;
    const previousViews = previous ? normalizeMeasuredValue(readNullableNumber(previous.value, ["view", "views", "viewCount", "viewCnt", "pageView", "pageViews"])) : views;
    const monthRange = preset === "month" ? buildMonthRangeLabel(entry.date, filtered[index + 1]?.date ?? null, displayEnd) : null;

    return {
      timestamp: entry.timestamp,
      label: monthRange?.weekLabel ?? formatGraphTickLabel(entry.date, hourly),
      fullLabel: formatGraphFullLabel(entry.date, hourly),
      visitors,
      views,
      prevRangeVisitors: previousVisitors,
      prevRangeViews: previousViews,
      rangeLabel: monthRange?.rangeLabel,
      extraAggregate: monthRange?.extraAggregate,
      additionalMessage: monthRange?.extraAggregate ? "추가 집계" : undefined,
    };
  });
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return hash;
}

function buildPerformanceSeries(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    const fallback = setPerformancePresetDates("15m");
    return buildPerformanceSeries(fallback.start, fallback.end);
  }

  const diffMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  const pointCount = diffMinutes <= 6 ? diffMinutes + 1 : diffMinutes <= 20 ? 6 : diffMinutes <= 90 ? 8 : 10;
  const stepMs = Math.max(60000, Math.floor((end.getTime() - start.getTime()) / Math.max(1, pointCount - 1)));

  const raw = Array.from({ length: pointCount }, (_, index) => {
    const current = new Date(start.getTime() + stepMs * index);
    const minuteIndex = Math.round((current.getTime() - start.getTime()) / 60000);
    const wave = Math.sin((minuteIndex + 1) * 0.55);
    const trend = Math.cos((minuteIndex + 1) * 0.32);
    const response = Math.max(88, Math.round(146 + wave * 18 + trend * 9 + diffMinutes * 0.22));
    const requests = Math.max(34, Math.round(88 + diffMinutes * 1.9 + wave * 20 + trend * 12 + index * 4));
    const error = Math.max(0.1, Number((0.4 + Math.abs(wave) * 0.55 + (trend > 0 ? trend * 0.14 : 0)).toFixed(1)));
    const previousResponse = Math.max(80, Math.round(response + Math.sin((minuteIndex + 2) * 0.28) * 12 - 6));
    const previousRequests = Math.max(25, Math.round(requests - 10 + Math.cos((minuteIndex + 3) * 0.41) * 11));
    const previousError = Math.max(0.1, Number((error + Math.sin((minuteIndex + 2) * 0.34) * 0.18 - 0.08).toFixed(1)));
    return {
      label: `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`,
      fullLabel: `${current.getMonth() + 1}/${current.getDate()} ${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`,
      response,
      requests,
      error,
      previousResponse,
      previousRequests,
      previousError,
    };
  });

  return raw.map((point, index) => ({
    ...point,
    prevRangeResponse: index === 0 ? point.response : raw[index - 1].response,
    prevRangeRequests: index === 0 ? point.requests : raw[index - 1].requests,
    prevRangeError: index === 0 ? point.error : raw[index - 1].error,
  }));
}

function buildEndpointHistory(endpoint: string, startStr: string, endStr: string): EndpointHistoryPoint[] {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const baseSeed = hashString(endpoint);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return [];

  const diffMinutes = Math.max(5, Math.round((end.getTime() - start.getTime()) / 60000));
  const pointCount = diffMinutes <= 20 ? 6 : diffMinutes <= 90 ? 8 : 10;
  const stepMs = Math.max(60000, Math.floor((end.getTime() - start.getTime()) / Math.max(1, pointCount - 1)));
  const endpointMeta = endpointTraffic.find((item) => item.endpoint === endpoint);
  const avgMs = endpointMeta?.avgMs ?? 140;
  const requestsBase = endpointMeta?.requests ?? 70;
  const errorBase = endpointMeta?.errorRate ?? 0.3;

  const raw = Array.from({ length: pointCount }, (_, index) => {
    const current = new Date(start.getTime() + stepMs * index);
    const wave = Math.sin((index + 1) * 0.7 + baseSeed / 1000);
    const trend = Math.cos((index + 1) * 0.42 + baseSeed / 1300);
    return {
      label: `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`,
      fullLabel: `${current.getMonth() + 1}/${current.getDate()} ${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`,
      response: Math.max(48, Math.round(avgMs + wave * 16 + trend * 9)),
      requests: Math.max(6, Math.round(requestsBase / 8 + index * 2 + wave * 5 + trend * 4)),
      error: Math.max(0, Number((errorBase + Math.abs(wave) * 0.22 + (trend > 0 ? trend * 0.05 : 0)).toFixed(2))),
    };
  });

  return raw.map((point, index) => ({
    ...point,
    prevRangeResponse: index === 0 ? point.response : raw[index - 1].response,
    prevRangeRequests: index === 0 ? point.requests : raw[index - 1].requests,
    prevRangeError: index === 0 ? point.error : raw[index - 1].error,
  }));
}

function ChartTooltipCard({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="min-w-[250px] rounded-2xl border border-border/70 bg-background/95 p-4 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

function TooltipRow({ color, label, value, delta }: { color: string; label: string; value: string; delta?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 px-3 py-2.5">
      <div className="flex items-center justify-between gap-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      {delta ? <div className="mt-1">{delta}</div> : null}
    </div>
  );
}

function EmptyChartDot(): ReactElement<SVGElement> {
  return <circle cx={0} cy={0} r={0} />;
}

function renderOverviewDot(color: string) {
  return ({ cx, cy, payload, index }: ChartDotProps): ReactElement<SVGElement> => {
    if (cx == null || cy == null) return EmptyChartDot();
    const point = payload as OverviewGraphPoint;
    return (
      <circle
        key={`${point.timestamp}-${index}`}
        cx={cx}
        cy={cy}
        r={2.8}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth={1.8}
      />
    );
  };
}

function renderVisitorFlowDot(color: string, keyPrefix: string) {
  return ({ cx, cy, payload, index }: ChartDotProps): ReactElement<SVGElement> => {
    if (cx == null || cy == null) return EmptyChartDot();
    const point = payload as VisitorFlowPoint;
    return (
      <circle
        key={`${keyPrefix}-${point.timestamp ?? point.label}-${index}`}
        cx={cx}
        cy={cy}
        r={2.8}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth={1.8}
      />
    );
  };
}

function VisitorsChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: VisitorFlowPoint }>; label?: string }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const rows = [
    { color: COLORS.visitors, label: "방문자", value: point.visitors, suffix: "명", previous: point.prevRangeVisitors },
    { color: COLORS.views, label: "조회수", value: point.views, suffix: "회", previous: point.prevRangeViews },
  ].sort((a, b) => b.value - a.value);

  return (
    <ChartTooltipCard label={point.fullLabel ?? label}>
      {point.rangeLabel ? <p className="-mt-1 text-[11px] text-muted-foreground">{point.rangeLabel}</p> : null}
      {point.additionalMessage ? <p className="-mt-1 text-[11px] font-medium text-primary/80">{point.additionalMessage}</p> : null}
      {rows.map((row) => (
        <TooltipRow key={row.label} color={row.color} label={row.label} value={`${row.value.toLocaleString()}${row.suffix}`} delta={<DeltaText current={row.value} previous={row.previous} suffix={row.suffix} />} />
      ))}
    </ChartTooltipCard>
  );
}

function EngagementTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: ChartTimePoint }>; label?: string }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <ChartTooltipCard label={label}>
      <TooltipRow color={COLORS.comments} label="댓글" value={`${point.comments.toLocaleString()}건`} delta={<DeltaText current={point.comments} previous={point.prevRangeComments} suffix="건" />} />
      <TooltipRow color={COLORS.likes} label="좋아요" value={`${point.likes.toLocaleString()}건`} delta={<DeltaText current={point.likes} previous={point.prevRangeLikes} suffix="건" />} />
    </ChartTooltipCard>
  );
}

function PerformanceTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; payload?: PerformancePoint }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const response = payload.find((item) => item.dataKey === "response")?.value ?? 0;
  const error = payload.find((item) => item.dataKey === "error")?.value ?? 0;
  return (
    <ChartTooltipCard label={label ?? point?.fullLabel}>
      <TooltipRow color={COLORS.response} label="응답시간" value={`${response}ms`} delta={point ? <DeltaText current={response} previous={point.prevRangeResponse} suffix="ms" /> : undefined} />
      <TooltipRow color={COLORS.error} label="에러율" value={`${error}%`} delta={point ? <DeltaText current={error} previous={point.prevRangeError} suffix="%" /> : undefined} />
    </ChartTooltipCard>
  );
}

function RequestsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; payload?: PerformancePoint }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const value = payload[0]?.value ?? 0;
  return (
    <ChartTooltipCard label={label ?? point?.fullLabel}>
      <TooltipRow color={COLORS.requests} label="요청 수" value={`${value.toLocaleString()}회`} delta={point ? <DeltaText current={value} previous={point.prevRangeRequests} suffix="회" /> : undefined} />
    </ChartTooltipCard>
  );
}

function EndpointTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; payload?: EndpointHistoryPoint }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const response = payload.find((item) => item.dataKey === "response")?.value ?? 0;
  const requests = payload.find((item) => item.dataKey === "requests")?.value ?? 0;
  const error = payload.find((item) => item.dataKey === "error")?.value ?? 0;
  return (
    <ChartTooltipCard label={label}>
      <TooltipRow color={COLORS.response} label="응답시간" value={`${response}ms`} delta={point ? <DeltaText current={response} previous={point.prevRangeResponse} suffix="ms" /> : undefined} />
      <TooltipRow color={COLORS.requests} label="요청 수" value={`${requests}회`} delta={point ? <DeltaText current={requests} previous={point.prevRangeRequests} suffix="회" /> : undefined} />
      <TooltipRow color={COLORS.error} label="에러율" value={`${error}%`} delta={point ? <DeltaText current={error} previous={point.prevRangeError} suffix="%" /> : undefined} />
    </ChartTooltipCard>
  );
}


function scaleEndpointTraffic(rows: EndpointRow[], startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return rows;

  const diffMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  const durationFactor = Math.max(0.55, Math.min(2.25, Math.log10(diffMinutes + 10)));

  return rows.map((row, index) => {
    const seed = hashString(row.endpoint);
    const swing = ((seed % 13) - 6) / 100;
    const trafficFactor = Math.max(0.42, durationFactor + swing);
    const responseFactor = Math.max(0.9, Math.min(1.2, 0.96 + durationFactor * 0.04 + swing / 2));
    const errorFactor = Math.max(0.7, Math.min(1.6, 0.92 + durationFactor * 0.08 + swing));

    return {
      ...row,
      requests: Math.max(8, Math.round(row.requests * trafficFactor)),
      avgMs: Math.max(48, Math.round(row.avgMs * responseFactor + index * 2)),
      errorRate: Number(Math.max(0.1, row.errorRate * errorFactor).toFixed(1)),
    };
  });
}

const categoryMeta = {
  analytics: { icon: BookOpen, label: "분석" },
  security: { icon: ShieldAlert, label: "보안" },
  manage: { icon: Users, label: "관리" },
  performance: { icon: Activity, label: "성능" },
} as const;

type CategoryKey = keyof typeof categoryMeta;
type AnalyticsView = "overview" | "visitors" | "posts" | "engagement";
type OverviewMetric = "visitors" | "comments" | "likes" | "responseMs";
type ManageView = "members" | "posts" | "comments";
type PerformanceView = "overview" | "traffic" | "endpoints";

export function AdminDashboard() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("analytics");
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>("overview");
  const [overviewMetric, setOverviewMetric] = useState<OverviewMetric>("visitors");
  const [manageView, setManageView] = useState<ManageView>("members");
  const [performanceView, setPerformanceView] = useState<PerformanceView>("overview");
  const initialAnalyticsRange = useMemo(() => setPresetDates("week"), []);
  const [rangePreset, setRangePreset] = useState<RangePreset>("week");
  const [dateStart, setDateStart] = useState(initialAnalyticsRange.start);
  const [dateEnd, setDateEnd] = useState(initialAnalyticsRange.end);
  const [searchMember, setSearchMember] = useState("");
  const [postFilter, setPostFilter] = useState<"all" | "deleted" | "active">("all");
  const [commentFilter, setCommentFilter] = useState<"all" | "deleted" | "active">("all");
  const [commentAuthorFilter, setCommentAuthorFilter] = useState<"all" | "회원" | "비회원">("all");
  const [performancePreset, setPerformancePreset] = useState<PerformancePreset>("15m");
  const [customMinutes, setCustomMinutes] = useState(90);
  const [performanceStart, setPerformanceStart] = useState(setPerformancePresetDates("15m").start);
  const [performanceEnd, setPerformanceEnd] = useState(setPerformancePresetDates("15m").end);
  const [endpointPage, setEndpointPage] = useState(1);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointRow | null>(null);
  const [overviewSummaryApi, setOverviewSummaryApi] = useState<DashboardSummaryData>(OVERVIEW_SUMMARY_EMPTY);
  const [overviewGraphApi, setOverviewGraphApi] = useState<OverviewGraphPoint[]>([]);
  const [visitorFlowApi, setVisitorFlowApi] = useState<VisitorFlowPoint[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewGraphLoading, setOverviewGraphLoading] = useState(false);
  const [visitorFlowLoading, setVisitorFlowLoading] = useState(false);

  useEffect(() => {
    if (analyticsView !== "overview") return;
    const controller = new AbortController();
    const params = buildSummaryParams(rangePreset, dateStart, dateEnd);
    if (!params) return;

    setOverviewLoading(true);
    fetch(`${API_BASE_URL}/dashboard/summary?${params.toString()}`, { signal: controller.signal, credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("summary fetch failed");
        const json = await response.json();
        const data = json?.data;
        setOverviewSummaryApi({
          visitors: data?.visitor ?? { avgCurrent: null, avgDelta: null },
          comments: data?.comment ?? { avgCurrent: null, avgDelta: null },
          likes: data?.like ?? { avgCurrent: null, avgDelta: null },
          responseMs: data?.avgApiResMs ?? { avgCurrent: null, avgDelta: null },
        });
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setOverviewSummaryApi(OVERVIEW_SUMMARY_EMPTY);
      })
      .finally(() => {
        if (!controller.signal.aborted) setOverviewLoading(false);
      });

    return () => controller.abort();
  }, [analyticsView, rangePreset, dateStart, dateEnd]);

  useEffect(() => {
    if (analyticsView !== "overview") return;
    const controller = new AbortController();
    const params = buildSummaryParams(rangePreset, dateStart, dateEnd);
    if (!params) return;
    params.set("type", OVERVIEW_TYPE_MAP[overviewMetric]);

    setOverviewGraphLoading(true);
    fetch(`${API_BASE_URL}/dashboard/graph?${params.toString()}`, { signal: controller.signal, credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("graph fetch failed");
        const json = await response.json();
        const timeStamps = json?.data?.timeStamps ?? {};
        setOverviewGraphApi(transformOverviewGraphData(overviewMetric, timeStamps, rangePreset, dateStart, dateEnd));
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setOverviewGraphApi([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setOverviewGraphLoading(false);
      });

    return () => controller.abort();
  }, [analyticsView, overviewMetric, rangePreset, dateStart, dateEnd]);

  useEffect(() => {
    if (analyticsView !== "visitors") return;
    const controller = new AbortController();
    const params = buildSummaryParams(rangePreset, dateStart, dateEnd);
    if (!params) return;

    setVisitorFlowLoading(true);
    fetch(`${API_BASE_URL}/dashboard/view?${params.toString()}`, { signal: controller.signal, credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("visitor flow fetch failed");
        const json = await response.json();
        setVisitorFlowApi(transformVisitorFlowData(json?.data, rangePreset, dateStart, dateEnd));
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setVisitorFlowApi([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setVisitorFlowLoading(false);
      });

    return () => controller.abort();
  }, [analyticsView, rangePreset, dateStart, dateEnd]);

  const currentBundle = useMemo(() => {
    if (rangePreset === "custom") return buildCustomBundle(dateStart, dateEnd);
    return analyticsByRange[rangePreset];
  }, [rangePreset, dateStart, dateEnd]);

  const analyticsChartData = useMemo(() => buildChartHistory(currentBundle.history, currentBundle.summary.avgResponseMs), [currentBundle.history, currentBundle.summary.avgResponseMs]);
  const analyticsTotals = useMemo(() => summarizeHistory(currentBundle.history), [currentBundle.history]);
  const summary = currentBundle.summary;

  const filteredMembers = useMemo(() => {
    const q = searchMember.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => member.nickname.toLowerCase().includes(q));
  }, [searchMember]);

  const filteredPosts = useMemo(() => {
    if (postFilter === "all") return managedPosts;
    if (postFilter === "deleted") return managedPosts.filter((post) => post.status === "삭제됨");
    return managedPosts.filter((post) => post.status === "게시중");
  }, [postFilter]);

  const filteredComments = useMemo(() => {
    return managedComments.filter((comment) => {
      const statusMatch = commentFilter === "all" ? true : commentFilter === "deleted" ? comment.status === "삭제됨" : comment.status === "활성";
      const authorMatch = commentAuthorFilter === "all" ? true : comment.authorType === commentAuthorFilter;
      return statusMatch && authorMatch;
    });
  }, [commentFilter, commentAuthorFilter]);

  const performanceSeries = useMemo(() => buildPerformanceSeries(performanceStart, performanceEnd), [performanceStart, performanceEnd]);
  const performanceEndpoints = useMemo(() => scaleEndpointTraffic(endpointTraffic, performanceStart, performanceEnd), [performanceStart, performanceEnd]);
  const analyticsRangeLabel = useMemo(() => {
    if (rangePreset !== "custom") return formatRangeLabel(dateStart, dateEnd, rangeLabels[rangePreset]);
    const clipped = clampDateRange(dateStart, dateEnd);
    return formatRangeLabel(dateStart, clipped ? formatDateInputValue(clipped.end) : dateEnd, rangeLabels[rangePreset]);
  }, [dateStart, dateEnd, rangePreset]);
  const performanceRangeLabel = useMemo(() => {
    const label = performancePresetLabel(performancePreset, customMinutes);
    return `${label} 범위`;
  }, [performancePreset, customMinutes]);

  const performanceAverages = useMemo(() => {
    const totals = performanceSeries.reduce(
      (acc, point) => {
        acc.response += point.response;
        acc.previousResponse += point.previousResponse;
        acc.requests += point.requests;
        acc.previousRequests += point.previousRequests;
        acc.error += point.error;
        acc.previousError += point.previousError;
        return acc;
      },
      { response: 0, previousResponse: 0, requests: 0, previousRequests: 0, error: 0, previousError: 0 }
    );
    const count = Math.max(1, performanceSeries.length);
    return {
      response: Math.round(totals.response / count),
      previousResponse: Math.round(totals.previousResponse / count),
      requests: Math.round(totals.requests / count),
      previousRequests: Math.round(totals.previousRequests / count),
      error: Number((totals.error / count).toFixed(1)),
      previousError: Number((totals.previousError / count).toFixed(1)),
    };
  }, [performanceSeries]);

  const performanceDurationMinutes = useMemo(() => Math.max(1, Math.round((new Date(performanceEnd).getTime() - new Date(performanceStart).getTime()) / 60000)), [performanceStart, performanceEnd]);

  const pagedEndpoints = useMemo(() => {
    const sorted = [...performanceEndpoints].sort((a, b) => a.avgMs - b.avgMs);
    const startIndex = (endpointPage - 1) * 5;
    return sorted.slice(startIndex, startIndex + 5);
  }, [endpointPage, performanceEndpoints]);

  const endpointPageCount = Math.ceil(performanceEndpoints.length / 5);
  const performanceChartKey = `${performanceStart}-${performanceEnd}`;
  const selectedEndpointData = useMemo(() => (selectedEndpoint ? performanceEndpoints.find((item) => item.endpoint === selectedEndpoint.endpoint) ?? selectedEndpoint : null), [selectedEndpoint, performanceEndpoints]);

  const overviewMetricMeta: Record<OverviewMetric, { label: string; color: string; unit: string; summaryKey: DashboardMetricKey }> = {
    visitors: { label: "방문자", color: COLORS.visitors, unit: "명", summaryKey: "visitors" },
    comments: { label: "댓글", color: COLORS.comments, unit: "건", summaryKey: "comments" },
    likes: { label: "좋아요", color: COLORS.likes, unit: "건", summaryKey: "likes" },
    responseMs: { label: "평균 응답시간", color: COLORS.response, unit: "ms", summaryKey: "responseMs" },
  };

  const activeOverviewMetric = overviewMetricMeta[overviewMetric];
  const overviewSummary = useMemo(() => {
    const current = overviewSummaryApi[activeOverviewMetric.summaryKey];
    return {
      value: current.avgCurrent,
      delta: current.avgDelta,
      formatted: formatDashboardMetricValue(activeOverviewMetric.summaryKey, current.avgCurrent),
      deltaFormatted: formatDashboardDelta(activeOverviewMetric.summaryKey, current.avgDelta),
    };
  }, [activeOverviewMetric.summaryKey, overviewSummaryApi]);
  const endpointModalHistory = useMemo(() => (selectedEndpoint ? buildEndpointHistory(selectedEndpoint.endpoint, performanceStart, performanceEnd) : []), [selectedEndpoint, performanceStart, performanceEnd]);

  useEffect(() => {
    setEndpointPage(1);
  }, [performanceStart, performanceEnd]);

  const applyPreset = (preset: RangePreset) => {
    setRangePreset(preset);
    if (preset !== "custom") {
      const next = setPresetDates(preset);
      setDateStart(next.start);
      setDateEnd(next.end);
    }
  };

  const applyPerformancePreset = (preset: PerformancePreset) => {
    setPerformancePreset(preset);
    const next = preset === "custom"
      ? setPerformancePresetDates("1h", customMinutes)
      : setPerformancePresetDates(preset);
    setPerformanceStart(next.start);
    setPerformanceEnd(next.end);
  };

  return (
    <>
      <style jsx global>{`
        .overview-chart .recharts-line-curve {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: overviewLineDraw 0.95s ease-out forwards;
        }
        @keyframes overviewLineDraw {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <section className="space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-[36px] border border-border/70 bg-card/75 px-6 py-8 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.28)] backdrop-blur-sm md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.16),transparent_32%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                <ShieldAlert className="h-3.5 w-3.5" />
                Admin Console
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5" />
                Tabs + Range
              </span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              운영 대시보드
              <span className="mt-1 block text-primary">Admin Console</span>
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[520px]">
            {adminCategoryStats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
                <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.entries(categoryMeta) as [CategoryKey, (typeof categoryMeta)[CategoryKey]][]).map(([key, item]) => (
          <CategoryTab key={key} active={activeCategory === key} label={item.label} icon={item.icon} onClick={() => setActiveCategory(key)} />
        ))}
      </div>

      {activeCategory === "analytics" ? (
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <SideTab active={analyticsView === "overview"} label="개요" onClick={() => setAnalyticsView("overview")} />
            <SideTab active={analyticsView === "visitors"} label="방문자 흐름" onClick={() => setAnalyticsView("visitors")} />
            <SideTab active={analyticsView === "posts"} label="조회수 상위 게시글" onClick={() => setAnalyticsView("posts")} />
            <SideTab active={analyticsView === "engagement"} label="댓글 · 좋아요" onClick={() => setAnalyticsView("engagement")} />
          </div>

          <div className="space-y-6">
            <SectionTitle icon={BookOpen} eyebrow="Analytics" title="분석" />

            <Surface className="p-5 md:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">시작 날짜</span>
                    <input type="date" value={dateStart} onChange={(e) => { setDateStart(e.target.value); setRangePreset("custom"); }} className="h-11 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">끝 날짜</span>
                    <input type="date" value={dateEnd} onChange={(e) => { setDateEnd(e.target.value); setRangePreset("custom"); }} className="h-11 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["today", "week", "month", "custom"] as const).map((preset) => (
                    <button key={preset} type="button" onClick={() => applyPreset(preset)} className={cx("rounded-xl border px-3 py-2 text-sm transition-colors", rangePreset === preset ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground")}>
                      {rangeLabels[preset]}
                    </button>
                  ))}
                </div>
              </div>
            </Surface>

            {analyticsView === "overview" ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    icon={Users}
                    label="방문자"
                    value={formatDashboardMetricValue("visitors", overviewSummaryApi.visitors.avgCurrent)}
                    hint={<span className={cx("text-xs font-semibold", overviewSummaryApi.visitors.avgDelta !== null && overviewSummaryApi.visitors.avgDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : overviewSummaryApi.visitors.avgDelta !== null && overviewSummaryApi.visitors.avgDelta < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>{formatDashboardDelta("visitors", overviewSummaryApi.visitors.avgDelta)}</span>}
                    active={overviewMetric === "visitors"}
                    onClick={() => setOverviewMetric("visitors")}
                  />
                  <MetricCard
                    icon={MessageSquare}
                    label="댓글"
                    value={formatDashboardMetricValue("comments", overviewSummaryApi.comments.avgCurrent)}
                    hint={<span className={cx("text-xs font-semibold", overviewSummaryApi.comments.avgDelta !== null && overviewSummaryApi.comments.avgDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : overviewSummaryApi.comments.avgDelta !== null && overviewSummaryApi.comments.avgDelta < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>{formatDashboardDelta("comments", overviewSummaryApi.comments.avgDelta)}</span>}
                    active={overviewMetric === "comments"}
                    onClick={() => setOverviewMetric("comments")}
                  />
                  <MetricCard
                    icon={Heart}
                    label="좋아요"
                    value={formatDashboardMetricValue("likes", overviewSummaryApi.likes.avgCurrent)}
                    hint={<span className={cx("text-xs font-semibold", overviewSummaryApi.likes.avgDelta !== null && overviewSummaryApi.likes.avgDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : overviewSummaryApi.likes.avgDelta !== null && overviewSummaryApi.likes.avgDelta < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>{formatDashboardDelta("likes", overviewSummaryApi.likes.avgDelta)}</span>}
                    active={overviewMetric === "likes"}
                    onClick={() => setOverviewMetric("likes")}
                  />
                  <MetricCard
                    icon={Gauge}
                    label="평균 응답시간"
                    value={formatDashboardMetricValue("responseMs", overviewSummaryApi.responseMs.avgCurrent)}
                    hint={<span className={cx("text-xs font-semibold", overviewSummaryApi.responseMs.avgDelta !== null && overviewSummaryApi.responseMs.avgDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : overviewSummaryApi.responseMs.avgDelta !== null && overviewSummaryApi.responseMs.avgDelta < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>{formatDashboardDelta("responseMs", overviewSummaryApi.responseMs.avgDelta)}</span>}
                    active={overviewMetric === "responseMs"}
                    onClick={() => setOverviewMetric("responseMs")}
                  />
                </div>

                <Surface className="overflow-hidden p-6 md:p-7">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Overview</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">{activeOverviewMetric.label} 흐름</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{analyticsRangeLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">집계 기준</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{overviewSummary.formatted}</p>
                      <p className={cx("mt-2 text-sm font-semibold", overviewSummary.delta !== null && overviewSummary.delta > 0 ? "text-emerald-600 dark:text-emerald-400" : overviewSummary.delta !== null && overviewSummary.delta < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>{overviewSummary.deltaFormatted}</p>
                    </div>
                  </div>
                  <div className="overview-chart relative h-[360px] w-full rounded-[24px] border border-border/50 bg-background/20 px-2 pb-2 pt-4 md:px-4">
                    {overviewLoading || overviewGraphLoading ? <div className="absolute right-4 top-4 text-xs text-muted-foreground">불러오는 중…</div> : null}
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart key={`overview-${overviewMetric}-${rangePreset}-${dateStart}-${dateEnd}`} data={overviewGraphApi} margin={{ top: 12, right: 28, left: 8, bottom: 8 }}>
                        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={6} interval={0} minTickGap={0} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={68} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const firstPayload = payload.find((item) => item?.payload)?.payload;
                            const point = firstPayload as OverviewGraphPoint | undefined;
                            if (!point) return null;
                            const metricValue = point.value;
                            const observedText = activeOverviewMetric.summaryKey === "responseMs" ? (point.observed ? formatDashboardMetricValue(activeOverviewMetric.summaryKey, metricValue) : "측정되지 않음") : formatDashboardMetricValue(activeOverviewMetric.summaryKey, metricValue);
                            const deltaText = point.delta === null ? "-" : formatDashboardDelta(activeOverviewMetric.summaryKey, point.delta);
                            return (
                              <div className="min-w-[240px] rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                                <p className="text-xs font-medium text-muted-foreground">{point.fullLabel}</p>
                                {point.rangeLabel ? <p className="mt-1 text-[11px] text-muted-foreground">{point.rangeLabel}</p> : null}
                                {point.additionalMessage ? <p className="mt-1 text-[11px] font-medium text-primary/80">{point.additionalMessage}</p> : null}
                                <div className="mt-3 rounded-2xl border border-border/60 bg-card/70 px-3 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeOverviewMetric.color }} />
                                      <span className="text-sm font-medium text-foreground">{activeOverviewMetric.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">{observedText}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                                    <span className="text-muted-foreground">이전 시간대 대비</span>
                                    <span className={cx(point.delta !== null && point.delta > 0 ? "text-emerald-600 dark:text-emerald-400" : point.delta !== null && point.delta < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground", "font-semibold")}>{deltaText}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                          cursor={{ stroke: "currentColor", strokeOpacity: 0.08 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="lineValue"
                          stroke={activeOverviewMetric.color}
                          strokeWidth={2.6}
                          connectNulls={overviewMetric !== "responseMs"}
                          dot={overviewMetric === "responseMs" ? false : renderOverviewDot(activeOverviewMetric.color)}
                          activeDot={false}
                          isAnimationActive={false}
                          pathLength={1}
                          className="overview-animated-line"
                        />
                        {overviewMetric === "responseMs" ? (
                          <Scatter
                            data={overviewGraphApi.map((point) => ({ ...point, scatterValue: point.pointValue }))}
                            dataKey="scatterValue"
                            fill={activeOverviewMetric.color}
                            isAnimationActive={false}
                            shape={(props: unknown) => {
                              const { cx, cy, payload } = props as ChartDotProps;
                              if (cx == null || cy == null) return EmptyChartDot();
                              const point = payload as OverviewGraphPoint & { scatterValue: number };
                              return (
                                <circle
                                  key={`scatter-${point.timestamp}`}
                                  cx={cx}
                                  cy={cy}
                                  r={point.observed ? 2.8 : 3.2}
                                  fill={point.observed ? activeOverviewMetric.color : "hsl(var(--background))"}
                                  stroke={activeOverviewMetric.color}
                                  strokeWidth={point.observed ? 1.8 : 1.8}
                                  strokeOpacity={point.observed ? 1 : 0.65}
                                />
                              );
                            }}
                          />
                        ) : null}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Surface>
              </>
            ) : null}

            {analyticsView === "visitors" ? (
              <>
                <Surface className="overflow-hidden p-6 md:p-7">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Visitors</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">방문자 히스토리</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{analyticsRangeLabel}</p>
                  </div>
                  <div className="overview-chart relative h-[360px] w-full rounded-[24px] border border-border/50 bg-background/20 px-2 pb-2 pt-4 md:px-4">
                    {visitorFlowLoading ? <div className="absolute right-4 top-4 text-xs text-muted-foreground">불러오는 중…</div> : null}
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart key={`visitors-${rangePreset}-${dateStart}-${dateEnd}`} data={visitorFlowApi} margin={{ top: 12, right: 28, left: 8, bottom: 8 }}>
                        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={6} interval={0} minTickGap={0} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={68} />
                        <Tooltip content={<VisitorsChartTooltip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.08 }} />
                        <Line
                          type="monotone"
                          dataKey="visitors"
                          stroke={COLORS.visitors}
                          strokeWidth={2.6}
                          dot={renderVisitorFlowDot(COLORS.visitors, "visitors")}
                          activeDot={false}
                          isAnimationActive={false}
                          pathLength={1}
                          className="overview-animated-line"
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke={COLORS.views}
                          strokeWidth={2.2}
                          dot={renderVisitorFlowDot(COLORS.views, "views")}
                          activeDot={false}
                          isAnimationActive={false}
                          pathLength={1}
                          className="overview-animated-line"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Surface>
              </>
            ) : null}

            {analyticsView === "posts" ? (
              <Surface className="p-6 md:p-7">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Top Posts</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">조회수 상위 게시글 TOP 10</h3>
                </div>
                <div className="space-y-3">
                  {currentBundle.topPosts.map((post, index) => (
                    <div key={post.title} className="grid gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-4 md:grid-cols-[56px_minmax(0,1fr)_120px_110px] md:items-center">
                      <div className="text-sm font-semibold text-foreground">#{index + 1}</div>
                      <p className="text-sm font-semibold text-foreground">{post.title}</p>
                      <div className="text-sm text-muted-foreground md:text-right">{post.views.toLocaleString()}회</div>
                      <div className={cx("text-sm font-semibold md:text-right", post.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : post.trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                        {post.trend === "up" ? `+${post.deltaPercent}%` : post.trend === "down" ? `-${Math.abs(post.deltaPercent)}%` : "0%"}
                      </div>
                    </div>
                  ))}
                </div>
              </Surface>
            ) : null}

            {analyticsView === "engagement" ? (
              <Surface className="p-6 md:p-7">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Engagement</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">댓글 · 좋아요 추이</h3>
                </div>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsChartData} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
                      <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={56} />
                      <Tooltip content={<EngagementTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.04 }} />
                      <Bar dataKey="comments" radius={[10, 10, 4, 4]} fill={COLORS.comments} isAnimationActive={false} />
                      <Bar dataKey="likes" radius={[10, 10, 4, 4]} fill={COLORS.likes} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Surface>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeCategory === "security" ? (
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <SideTab active label="WARN 로그" onClick={() => {}} />
          </div>
          <div className="space-y-6">
            <SectionTitle icon={ShieldAlert} eyebrow="Security" title="보안" />
            <Surface className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border/70 bg-background/70 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  WARN Logs
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  최근 기록
                </div>
              </div>
              <div className="space-y-0 bg-[#0b1020] px-5 py-4 font-mono text-[13px] leading-7 text-slate-200">
                {warnLogs.map((log, index) => (
                  <div key={index} className="border-b border-white/5 py-2 last:border-b-0">
                    <span className="mr-3 text-amber-400">WARN</span>
                    <span className="break-all text-slate-200">{log.replace("[WARN] ", "")}</span>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      ) : null}

      {activeCategory === "manage" ? (
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <SideTab active={manageView === "members"} label="회원 관리" onClick={() => setManageView("members")} />
            <SideTab active={manageView === "posts"} label="게시글 관리" onClick={() => setManageView("posts")} />
            <SideTab active={manageView === "comments"} label="댓글 관리" onClick={() => setManageView("comments")} />
          </div>
          <div className="space-y-6">
            <SectionTitle icon={Users} eyebrow="Management" title="관리" />

            {manageView === "members" ? (
              <>
                <Surface className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Members</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">회원 검색</h3>
                    </div>
                    <label className="flex h-11 w-full items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 text-sm text-muted-foreground md:max-w-sm">
                      <Search className="h-4 w-4" />
                      <input value={searchMember} onChange={(e) => setSearchMember(e.target.value)} placeholder="회원 닉네임 검색" className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground" />
                    </label>
                  </div>
                </Surface>
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <Surface key={member.nickname} className="p-5">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_150px_90px_90px] md:items-center">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{member.nickname}</p>
                          <p className="mt-1 text-xs text-muted-foreground">마지막 접속 {member.lastSeen} · {member.client}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                        <div className="text-sm text-muted-foreground">최근 접속 클라이언트</div>
                        <div className="text-sm"><p className="text-muted-foreground">좋아요</p><p className="mt-1 font-semibold text-foreground">{member.likes}</p></div>
                        <div className="text-sm"><p className="text-muted-foreground">댓글</p><p className="mt-1 font-semibold text-foreground">{member.comments}</p></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["닉네임 수정", "비밀번호 변경", "권한 부여", "좋아요 · 댓글 보기"].map((text) => (
                          <button key={text} type="button" className="rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/20 hover:text-primary">{text}</button>
                        ))}
                      </div>
                    </Surface>
                  ))}
                </div>
              </>
            ) : null}

            {manageView === "posts" ? (
              <>
                <Surface className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Posts</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">게시글 관리</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {([['all', '전체'], ['active', '게시중'], ['deleted', '삭제된 게시글']] as const).map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setPostFilter(key)} className={cx("rounded-xl border px-3 py-2 text-sm transition-colors", postFilter === key ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground")}>{label}</button>
                      ))}
                    </div>
                  </div>
                </Surface>
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <Surface key={post.id} className="p-5">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_100px_180px] md:items-center">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{post.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">작성자 {post.writer}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{post.status}</div>
                        <div className="text-sm text-muted-foreground">조회수 {post.views.toLocaleString()}회</div>
                        <div className="text-sm text-muted-foreground">{post.status === '삭제됨' ? `삭제 ${post.deletedAt}` : `수정 ${post.updatedAt}`}</div>
                      </div>
                    </Surface>
                  ))}
                </div>
              </>
            ) : null}

            {manageView === "comments" ? (
              <>
                <Surface className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Comments</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">댓글 관리</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {([['all', '전체'], ['active', '활성 댓글'], ['deleted', '삭제된 댓글']] as const).map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setCommentFilter(key)} className={cx("rounded-xl border px-3 py-2 text-sm transition-colors", commentFilter === key ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground")}>{label}</button>
                      ))}
                      {([['all', '전체 작성자'], ['회원', '회원'], ['비회원', '비회원']] as const).map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setCommentAuthorFilter(key)} className={cx("rounded-xl border px-3 py-2 text-sm transition-colors", commentAuthorFilter === key ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground")}>{label}</button>
                      ))}
                    </div>
                  </div>
                </Surface>
                <div className="space-y-3">
                  {filteredComments.map((comment) => (
                    <Surface key={comment.id} className="p-5">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_100px_100px_150px] md:items-center">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{comment.articleTitle}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{comment.author} · {comment.createdAt}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{comment.authorType}</div>
                        <div className="text-sm text-muted-foreground">{comment.status}</div>
                        <div className="text-sm text-muted-foreground">{comment.status === '삭제됨' ? `삭제 ${comment.deletedAt}` : `좋아요 ${comment.likes}`}</div>
                      </div>
                    </Surface>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeCategory === "performance" ? (
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <SideTab active={performanceView === "overview"} label="개요" onClick={() => setPerformanceView("overview")} />
            <SideTab active={performanceView === "traffic"} label="트래픽 추이" onClick={() => setPerformanceView("traffic")} />
            <SideTab active={performanceView === "endpoints"} label="엔드포인트" onClick={() => setPerformanceView("endpoints")} />
          </div>
          <div className="space-y-6">
            <SectionTitle icon={Activity} eyebrow="Performance" title="성능 모니터링" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {performanceCards.map((card) => {
                const Icon = card.icon;
                const overrideValue = card.key === "response" ? `${performanceAverages.response}ms` : card.key === "error" ? `${performanceAverages.error}%` : card.key === "requests" ? `${performanceAverages.requests.toLocaleString()}회` : card.value;
                const overrideHint = card.key === "response" ? <DeltaText current={performanceAverages.response} previous={performanceAverages.previousResponse} suffix="ms" /> : card.key === "error" ? <DeltaText current={performanceAverages.error} previous={performanceAverages.previousError} suffix="%" /> : card.key === "requests" ? <DeltaText current={performanceAverages.requests} previous={performanceAverages.previousRequests} suffix="회" /> : card.hint;
                return <MetricCard key={card.label} icon={Icon} label={card.label} value={overrideValue} hint={overrideHint} />;
              })}
            </div>

            <Surface className="p-5 md:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">시간 범위</p>
                    <p className="mt-1 text-sm text-muted-foreground">{performanceRangeLabel}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">모든 성능 탭에 동일하게 적용</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PERFORMANCE_PRESET_OPTIONS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => applyPerformancePreset(preset.key)}
                      className={cx(
                        "rounded-xl border px-3 py-2 text-sm transition-colors",
                        performancePreset === preset.key ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPerformancePreset("custom");
                      const next = setPerformancePresetDates("1h", customMinutes);
                      setPerformanceStart(next.start);
                      setPerformanceEnd(next.end);
                    }}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-sm transition-colors",
                      performancePreset === "custom" ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
>
                    직접 설정
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>사용자 지정</span>
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={customMinutes}
                      onChange={(e) => {
                        const nextMinutes = Math.max(1, Math.min(1440, Number(e.target.value) || 1));
                        setCustomMinutes(nextMinutes);
                        setPerformancePreset("custom");
                        const next = setPerformancePresetDates("1h", nextMinutes);
                        setPerformanceStart(next.start);
                        setPerformanceEnd(next.end);
                      }}
                      className="h-10 w-28 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none"
                    />
                    <span>분</span>
                  </label>
                </div>
              </div>
            </Surface>

            {performanceView === "overview" ? (
              <>
                <Surface className="p-6 md:p-7">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Overview</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">응답시간 · 에러율</h3>
                    </div>
                    <div className="text-right">
                      <p className={cx("text-sm font-semibold", tinyValueColor(performanceAverages.response))}>평균 {performanceAverages.response}ms</p>
                      <div className="mt-1"><DeltaText current={performanceAverages.response} previous={performanceAverages.previousResponse} suffix="ms" /></div>
                    </div>
                  </div>
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart key={`overview-${performanceChartKey}`} data={performanceSeries} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
                        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={56} />
                        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={56} />
                        <Tooltip content={<PerformanceTooltip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.08 }} />
                        <Line yAxisId="left" type="monotone" dataKey="response" stroke={COLORS.response} strokeWidth={2.6} dot={false} isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="error" stroke={COLORS.error} strokeWidth={2.2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Surface>
              </>
            ) : null}

            {performanceView === "traffic" ? (
              <Surface className="p-6 md:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Traffic</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">요청 수 추이</h3>
                  </div>
                  <div><DeltaText current={performanceAverages.requests} previous={performanceAverages.previousRequests} suffix="회" /></div>
                </div>
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart key={`traffic-${performanceChartKey}`} data={performanceSeries} margin={{ top: 10, right: 24, left: 8, bottom: 0 }}>
                      <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={56} />
                      <Tooltip content={<RequestsTooltip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.08 }} />
                      <Line type="monotone" dataKey="requests" stroke={COLORS.requests} strokeWidth={2.4} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Surface>
            ) : null}

            {performanceView === "endpoints" ? (
              <Surface className="p-6 md:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Endpoints</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">요청된 엔드포인트</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">빠른 순 · 페이지당 5개</div>
                </div>
                <div className="space-y-3">
                  {pagedEndpoints.map((endpoint) => {
                    const [method, ...rest] = endpoint.endpoint.split(" ");
                    const path = rest.join(" ");
                    return (
                      <button key={endpoint.endpoint} type="button" onClick={() => setSelectedEndpoint(endpoint)} className="grid w-full gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-4 text-left transition-colors hover:border-primary/20 md:grid-cols-[minmax(0,1fr)_112px_124px] md:items-center">
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <MethodBadge method={method} compact />
                            <div className="min-w-0 max-w-full">
                              <EndpointText path={path} />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">최근 요청 {endpoint.requests.toLocaleString()}회</p>
                        </div>
                        <div className={cx("text-sm font-semibold md:text-right", tinyValueColor(endpoint.avgMs))}>{endpoint.avgMs}ms</div>
                        <div className="text-sm text-muted-foreground md:text-right">에러율 {endpoint.errorRate}%</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <button type="button" onClick={() => setEndpointPage((prev) => Math.max(1, prev - 1))} disabled={endpointPage === 1} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" /> 이전
                  </button>
                  <p className="text-sm text-muted-foreground">{endpointPage} / {endpointPageCount}</p>
                  <button type="button" onClick={() => setEndpointPage((prev) => Math.min(endpointPageCount, prev + 1))} disabled={endpointPage === endpointPageCount} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-40">
                    다음 <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </Surface>
            ) : null}
          </div>
        </div>
      ) : null}

      {selectedEndpointData ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6" onClick={() => setSelectedEndpoint(null)}>
          <div className="w-full max-w-5xl rounded-[32px] border border-border/70 bg-background p-6 shadow-2xl md:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Endpoint Detail</p>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2.5">
                  <MethodBadge method={selectedEndpointData.endpoint.split(" ")[0]} />
                  <div className="min-w-0 max-w-full">
                    <EndpointText path={selectedEndpointData.endpoint.split(" ").slice(1).join(" ")} wrap />
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{`${performanceRangeLabel} · ${performanceDurationMinutes}분`}</p>
              </div>
              <button type="button" onClick={() => setSelectedEndpoint(null)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background/80 text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <Surface className="p-5"><p className="text-sm text-muted-foreground">평균 응답시간</p><p className={cx("mt-2 text-3xl font-bold tracking-tight", tinyValueColor(selectedEndpointData.avgMs))}>{selectedEndpointData.avgMs}ms</p></Surface>
              <Surface className="p-5"><p className="text-sm text-muted-foreground">최근 요청 수</p><p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{selectedEndpointData.requests.toLocaleString()}회</p></Surface>
              <Surface className="p-5"><p className="text-sm text-muted-foreground">에러율</p><p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{selectedEndpointData.errorRate}%</p></Surface>
            </div>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={endpointModalHistory} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={52} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={52} />
                  <Tooltip content={<EndpointTooltip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.08 }} />
                  <Line yAxisId="left" type="monotone" dataKey="response" stroke={COLORS.response} strokeWidth={2.4} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="requests" stroke={COLORS.requests} strokeWidth={2.2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="error" stroke={COLORS.error} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
      </section>
    </>
  );
}
