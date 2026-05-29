import { Background } from "@/components/background";
import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import { AdminDeletedPostsPage } from "@/components/admin/admin-deleted-posts-page";

export default function DeletedPostsAdminPage() {
  return (
    <>
      <Background />
      <Navigation />
      <PageTransition>
        <main className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto w-full">
            <AdminDeletedPostsPage />
          </div>
        </main>
      </PageTransition>
    </>
  );
}
