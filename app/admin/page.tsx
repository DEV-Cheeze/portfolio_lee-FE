import { Background } from "@/components/background";
import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  return (
    <>
      <Background />
      <Navigation />
      <PageTransition>
        <main className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto w-full">
            <AdminDashboard />
          </div>
        </main>
      </PageTransition>
    </>
  );
}
