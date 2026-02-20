import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getWpArticle, getWpArticles } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { WpArticle } from "@/types/contentful";
import { ArrowLeft } from "lucide-react";
import { CTABanner } from "@/components/brand";
import { EXTERNAL_LINKS } from "@/constants/links";

export const revalidate = 60;

type PageProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

const joinHtml = (article: WpArticle): string => {
  const chunks: (string | undefined)[] = [
    article.bodyHtml,
    article.bodyHtml2,
    article.bodyHtml3,
    article.bodyHtml4,
  ];
  return chunks.filter((value) => typeof value === "string" && value.length > 0).join(" ");
};

const sanitizeBody = (raw: string): string => {
  if (raw.trim().startsWith("<")) return raw;
  return raw
    .replace(/!\[([^\]]*)\]\((\/\/[^)]+)\)/g, '\n\n<img src="https:$2" alt="$1" />\n\n')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '\n\n<img src="$2" alt="$1" />\n\n')
    .replace(/\.\s*__([^_]+)__/g, ".\n\n<h2>$1</h2>\n\n")
    .replace(/__([^_]+)__/g, "\n\n<h2>$1</h2>\n\n")
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|img|ul|ol|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
};

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, "").trim();

const getExcerpt = (article: WpArticle): string => {
  const raw: string = article.excerptHtml || article.bodyHtml || "";
  const text: string = stripHtml(raw);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};

const getReadingTime = (html: string): number => {
  const text: string = stripHtml(html);
  const words: number = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const getImageUrl = (article: WpArticle): string | null => {
  const asset = article.featuredImage as unknown;
  if (!asset || typeof asset !== "object") return null;
  const assetObj = asset as Record<string, unknown>;
  const fields = assetObj.fields as Record<string, unknown> | undefined;
  if (fields && typeof fields === "object") {
    const file = fields.file as Record<string, unknown> | undefined;
    if (file && typeof file.url === "string") {
      return file.url.startsWith("//") ? `https:${file.url}` : file.url;
    }
  }
  if ("url" in assetObj && typeof assetObj.url === "string") {
    return assetObj.url.startsWith("//") ? `https:${assetObj.url}` : assetObj.url;
  }
  return null;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getWpArticle(slug);
  if (response.error) {
    return genMeta({ title: "Article Not Found" });
  }
  const article: WpArticle = response.data;
  const imageUrl: string | null = getImageUrl(article);
  return genMeta({
    title: article.title,
    description: getExcerpt(article),
    image: imageUrl || undefined,
    canonical: `/news/${article.slug}`,
  });
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const response = await getWpArticles({ limit: 100 });
  if (response.error) return [];
  return response.data.items.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const response = await getWpArticle(slug);
  if (response.error) {
    notFound();
  }
  const article: WpArticle = response.data;
  const html: string = sanitizeBody(joinHtml(article));
  const imageUrl: string | null = getImageUrl(article);
  const authorName: string = article.author?.name || "Mama Tulia Ministries";
  const readingTime: number = getReadingTime(html);
  return (
    <>
      {/* Back nav */}
      <section className="bg-secondary pt-20">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Link>
        </div>
      </section>

      <article className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <header className="mx-auto max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Story of Hope
            </p>
            <h1 className="mt-3 font-serif text-3xl font-normal leading-tight md:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{authorName}</span>
              <span>·</span>
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span>·</span>
              <span>{readingTime} min read</span>
            </div>
          </header>

          {/* Featured Image */}
          {imageUrl && (
            <figure className="mx-auto mt-10 max-w-4xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-[var(--shadow-lg)]">
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </div>
            </figure>
          )}

          {/* Body */}
          <div className="mx-auto mt-12 max-w-3xl">
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight
                prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl
                prose-p:text-foreground/90 prose-p:leading-relaxed
                prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-foreground
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary prose-blockquote:py-4 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
                prose-img:rounded-xl prose-img:shadow-[var(--shadow-md)]
                prose-ul:my-6 prose-ol:my-6 prose-li:my-1"
            >
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>

          {/* Author footer */}
          <footer className="mx-auto mt-16 max-w-3xl border-t pt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-serif text-lg text-muted-foreground">
                {authorName[0]}
              </div>
              <div>
                <p className="font-medium">{authorName}</p>
                <p className="text-sm text-muted-foreground">Mama Tulia Ministries</p>
              </div>
            </div>
          </footer>
        </div>
      </article>

      {/* CTA */}
      <CTABanner
        title="Touched by this story?"
        description="Your gift helps us reach more mothers like this one."
        primaryButton={{ text: "Give a Preemie Kit", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "Read More Stories", href: "/news" }}
        variant="warm"
      />
    </>
  );
}
