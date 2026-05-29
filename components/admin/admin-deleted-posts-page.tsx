import { BookOpen, RefreshCcw } from "lucide-react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { deletedPosts } from "@/lib/admin-mock";

export function AdminDeletedPostsPage() {
  return (
    <AdminPageShell title="삭제된 게시물 관리" description="복구 가능한 게시물과 영구 삭제 대기 중인 게시물을 분리해서 확인하는 전용 화면입니다." icon={BookOpen}>
      <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm overflow-hidden shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
        {deletedPosts.map((item) => (
          <div key={`${item.title}-${item.deletedAt}`} className="px-5 py-5 border-b last:border-b-0 border-border/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-2">삭제 시각 {item.deletedAt}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.status === '복구 가능' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {item.status}
              </span>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <RefreshCcw className="w-4 h-4" /> 복구
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}
