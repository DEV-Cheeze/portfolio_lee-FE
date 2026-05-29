import { MessageSquare, RefreshCcw } from "lucide-react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { deletedComments } from "@/lib/admin-mock";

export function AdminDeletedCommentsPage() {
  return (
    <AdminPageShell title="삭제된 댓글 관리" description="삭제된 댓글 내역을 전용 페이지로 분리해 상태 확인과 복구 동작을 붙이기 쉽게 구성했습니다." icon={MessageSquare}>
      <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm overflow-hidden shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
        {deletedComments.map((item) => (
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
