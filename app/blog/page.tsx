import { Navigation } from "@/components/navigation";
import { Background } from "@/components/background";
import { BlogContent } from "@/components/blog/blog-content";
import { PageTransition } from "@/components/page-transition";

export default function BlogPage() {
  return (
    <>
      <Background />
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-16" data-testid="page-blog">
        <div className="max-w-5xl mx-auto">
          <PageTransition>
            <div className="mb-12" data-testid="section-blog-intro">
              <div className="flex items-center gap-3 mb-4" data-testid="row-blog-overline">
                <div className="h-px w-8 bg-primary" />
                <span
                  className="text-xs font-bold tracking-[0.2em] uppercase text-primary/80"
                  data-testid="text-blog-overline"
                >
                  Technical Notes
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                data-testid="text-blog-heading"
              >
                기록하고 공유하기
              </h1>
              <p
                className="text-muted-foreground text-lg font-light italic"
                data-testid="text-blog-subheading"
              >
                개발 과정에서의 고민과 배움을 기록합니다.
              </p>
            </div>
            <BlogContent />
          </PageTransition>
        </div>
      </main>
    </>
  );
}
