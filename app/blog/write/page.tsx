import { Navigation } from "@/components/navigation";
import { Background } from "@/components/background";
import { BlogEditor } from "@/components/blog/blog-editor";

export default function WritePage() {
  return (
    <>
      <Background />
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <BlogEditor />
        </div>
      </main>
    </>
  );
}
