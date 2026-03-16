import { Navigation } from "@/components/navigation";
import { Background } from "@/components/background";
import { SignupForm } from "@/components/auth/signup-form";
import { PageTransition } from "@/components/page-transition";

export default function SignupPage() {
  return (
    <>
      <Background />
      <Navigation />
      <main className="min-h-screen pt-28 pb-16 px-4 md:px-8 flex items-center justify-center">
        <PageTransition>
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-px w-6 bg-primary" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/80">
                  Join Us
                </span>
                <div className="h-px w-6 bg-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">새로운 시작</h1>
            </div>
            <SignupForm />
          </div>
        </PageTransition>
      </main>
    </>
  );
}
