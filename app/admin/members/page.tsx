import { Background } from "@/components/background";
import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import { AdminMembersPage } from "@/components/admin/admin-members-page";

export default function MembersAdminPage() {
  return (
    <>
      <Background />
      <Navigation />
      <PageTransition>
        <main className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto w-full">
            <AdminMembersPage />
          </div>
        </main>
      </PageTransition>
    </>
  );
}
