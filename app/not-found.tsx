import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Background } from "@/components/background";

export default function NotFound() {
  return (
    <>
      <Background />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {/* 404 Number */}
          <div className="relative mb-8">
            <span className="text-[10rem] leading-none font-bold tracking-tighter text-primary/10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl font-bold text-primary">?</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-foreground mb-3 text-balance">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Home className="w-4 h-4" />
              홈으로 이동
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground border border-glass-border rounded-full font-medium hover:bg-muted/80 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              블로그로 이동
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
