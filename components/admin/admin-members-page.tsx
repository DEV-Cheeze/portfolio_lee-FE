"use client";

import { useMemo, useState } from "react";
import { Heart, Lock, MessageSquare, Search, ShieldAlert, Users } from "lucide-react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { members } from "@/lib/admin-mock";

function ActionChip({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors">
      {label}
    </button>
  );
}

export function AdminMembersPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => members.filter((member) => member.nickname.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  return (
    <AdminPageShell title="회원 관리" description="회원 닉네임 검색, 권한 확인, 마지막 접속 환경, 좋아요 및 댓글 활동을 전용 화면에서 관리할 수 있게 분리했습니다." icon={Users}>
      <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm p-5 md:p-6 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
        <label className="relative block">
          <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="회원 이름(닉네임)으로 검색"
            className="w-full h-12 rounded-2xl border border-border bg-background/70 pl-11 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/30"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((member) => (
          <div key={member.nickname} className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm p-5 md:p-6 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xl font-semibold text-foreground">{member.nickname}</p>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary">{member.role}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">마지막 접속 {member.lastSeen} · {member.client}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4" /> {member.likes} Likes</span>
                  <span className="inline-flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {member.comments} Comments</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionChip label="닉네임 수정" />
                <ActionChip label="비밀번호 변경" />
                <ActionChip label="권한 부여" />
                <ActionChip label="활동 보기" />
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm p-8 text-center text-muted-foreground shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
            검색 결과가 없어.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15"><Users className="w-5 h-5" /></div>
          <p className="text-sm text-muted-foreground mt-4">전체 회원</p>
          <p className="text-2xl font-bold text-foreground mt-1">{members.length}명</p>
        </div>
        <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15"><ShieldAlert className="w-5 h-5" /></div>
          <p className="text-sm text-muted-foreground mt-4">관리자 권한</p>
          <p className="text-2xl font-bold text-foreground mt-1">{members.filter((m) => m.role === 'ROLE_ADMIN').length}명</p>
        </div>
        <div className="rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.25)]">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15"><Lock className="w-5 h-5" /></div>
          <p className="text-sm text-muted-foreground mt-4">권한/계정 조작</p>
          <p className="text-2xl font-bold text-foreground mt-1">Ready</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
