import { Navigation } from "@/components/navigation";
import { Background } from "@/components/background";
import { NotificationsContent } from "@/components/notifications/notifications-content";
import { PageTransition } from "@/components/page-transition";

export default function NotificationsPage() {
  return (
    <>
      <Background />
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <PageTransition>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/80">
                  Updates
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">알림</h1>
            </div>
            <NotificationsContent />
          </PageTransition>
        </div>
      </main>
    </>
  );
}