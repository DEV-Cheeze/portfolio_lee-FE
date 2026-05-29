import Link from "next/link";
import type { ReactNode, ComponentType } from "react";
import { ChevronLeft } from "lucide-react";

export function AdminPageShell({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-[36px] border border-border/70 bg-card/75 backdrop-blur-sm px-6 py-8 md:px-8 md:py-10 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.16),transparent_32%)]" />
        <div className="relative space-y-5">
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Admin 홈으로
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-3xl">{description}</p>
            </div>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}
