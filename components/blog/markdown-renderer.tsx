"use client";

import {
  useState,
  useCallback,
  type ReactNode,
  type ReactElement,
  isValidElement,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200
        text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/60"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as ReactElement).props.children);
  }
  return "";
}

function normalizeMarkdownContent(content: string): string {
  if (!content) return "";

  let normalized = content.replace(/\r\n/g, "\n");

  if (!normalized.includes("\n") && normalized.includes(String.raw`\n`)) {
    normalized = normalized
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "");
  }

  return normalized;
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(url);
}

function getSingleAnchorHref(children: ReactNode): string | null {
  if (!children) return null;

  const childArray = Array.isArray(children) ? children : [children];
  const meaningfulChildren = childArray.filter(
    (child) => !(typeof child === "string" && child.trim() === "")
  );

  if (meaningfulChildren.length !== 1) {
    return null;
  }

  const onlyChild = meaningfulChildren[0];

  if (!isValidElement(onlyChild) || onlyChild.type !== "a") {
    return null;
  }

  const href = onlyChild.props?.href;
  return typeof href === "string" ? href : null;
}

function getLanguageFromClassName(className?: string): string {
  if (!className) return "";
  const match = /language-(\w+)/.exec(className);
  return match ? match[1] : "";
}

const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TypeScript (JSX)",
  jsx: "JavaScript (JSX)",
  java: "Java",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  cpp: "C++",
  c: "C",
  cs: "C#",
  csharp: "C#",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  kt: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  powershell: "PowerShell",
  dockerfile: "Dockerfile",
  docker: "Docker",
  graphql: "GraphQL",
  markdown: "Markdown",
  md: "Markdown",
  lua: "Lua",
  r: "R",
  scala: "Scala",
  dart: "Dart",
  elixir: "Elixir",
  haskell: "Haskell",
  perl: "Perl",
  vim: "Vim",
  toml: "TOML",
  ini: "INI",
  nginx: "Nginx",
  diff: "Diff",
};

function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang.toLowerCase()] || lang.toUpperCase();
}

function createHeadingIdFactory() {
  const slugCount = new Map<string, number>();

  return (children: ReactNode) => {
    const rawText = extractText(children).trim();
    const baseSlug = rawText
      .toLowerCase()
      .replace(/[^\w\s가-힣-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() || "section";

    const currentCount = slugCount.get(baseSlug) ?? 0;
    slugCount.set(baseSlug, currentCount + 1);

    return currentCount === 0 ? `heading-${baseSlug}` : `heading-${baseSlug}-${currentCount + 1}`;
  };
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const normalizedContent = normalizeMarkdownContent(content);
  const getHeadingId = createHeadingIdFactory();

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => {
            const id = getHeadingId(children);
            return (
              <h1
                id={id}
                className="text-3xl font-bold text-foreground mt-8 mb-4 first:mt-0 scroll-mt-24"
              >
                <span data-heading-highlight={id} className="toc-heading-highlight-target">
                  {children}
                </span>
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = getHeadingId(children);
            return (
              <h2
                id={id}
                className="text-2xl font-semibold text-foreground mt-7 mb-3 scroll-mt-24"
              >
                <span data-heading-highlight={id} className="toc-heading-highlight-target">
                  {children}
                </span>
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = getHeadingId(children);
            return (
              <h3
                id={id}
                className="text-xl font-semibold text-foreground mt-6 mb-2 scroll-mt-24"
              >
                <span data-heading-highlight={id} className="toc-heading-highlight-target">
                  {children}
                </span>
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-foreground mt-5 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => {
            const singleAnchorHref = getSingleAnchorHref(children);

            if (singleAnchorHref && isImageUrl(singleAnchorHref)) {
              return (
                <span className="block my-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={singleAnchorHref}
                    alt=""
                    className="max-w-full rounded-lg border border-glass-border"
                  />
                </span>
              );
            }

            return (
              <p className="text-foreground/90 leading-relaxed mb-4">
                {children}
              </p>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1 text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-3 pr-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => {
            const childEl = children as ReactElement;
            const codeClassName = childEl?.props?.className || "";
            const language = getLanguageFromClassName(codeClassName);
            const codeText = extractText(childEl?.props?.children);

            return (
              <div className="code-block-wrapper group relative my-5 rounded-xl overflow-hidden border border-neutral-700/80">
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700/80">
                  {language ? (
                    <span className="text-xs font-medium text-neutral-400 select-none">
                      {getLanguageLabel(language)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <CopyButton code={codeText} />
                </div>
                <pre className="code-block-pre overflow-x-auto p-4 m-0 text-sm leading-relaxed bg-neutral-900 text-neutral-200">
                  {children}
                </pre>
              </div>
            );
          },
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock =
              codeClassName &&
              (/language-/.test(codeClassName) || /hljs/.test(codeClassName));

            if (isBlock) {
              return (
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          },
          hr: () => <hr className="border-glass-border my-8" />,
          img: ({ src, alt }) => (
            <span className="block my-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src || ""}
                alt={alt || ""}
                className="max-w-full rounded-lg border border-glass-border"
              />
            </span>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-glass-border rounded-lg text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-glass-border px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-glass-border px-4 py-2 text-foreground/90">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          del: ({ children }) => (
            <del className="line-through text-muted-foreground">{children}</del>
          ),
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 accent-primary"
              {...props}
            />
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
