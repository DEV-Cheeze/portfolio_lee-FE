import { Navigation } from "@/components/navigation";
import { Background } from "@/components/background";
import { BlogEditor } from "@/components/blog/blog-editor";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;
  
  return (
    <>
      <Background />
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <BlogEditor mode="edit" articleId={id} />
        </div>
      </main>
    </>
  );
}
