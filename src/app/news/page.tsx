import type { Metadata } from "next";
import Image from "next/image";
import { getWpArticles } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { WpArticle } from "@/types/contentful";
import { StoryCard, CTABanner } from "@/components/brand";
import { EXTERNAL_LINKS } from "@/constants/links";

export const revalidate = 60;

export const metadata: Metadata = genMeta({
  title: "Stories of Hope",
  description: "Real stories from preemie mothers whose lives have been transformed through Mama Tulia Ministries.",
  canonical: "/news",
});

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
  return null;
};

const getExcerpt = (article: WpArticle): string => {
  const raw: string = article.excerptHtml || article.bodyHtml || "";
  const text: string = raw.replace(/<[^>]*>/g, "").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

export default async function StoriesPage() {
  const response = await getWpArticles({ limit: 50 });
  if (response.error) {
    return (
      <div className="container mx-auto px-4 py-32 pt-40">
        <h1 className="font-serif text-4xl font-normal">Stories</h1>
        <p className="mt-4 text-muted-foreground">Unable to load stories. Please try again later.</p>
      </div>
    );
  }
  const articles: readonly WpArticle[] = response.data.items;
  const featured: WpArticle | undefined = articles[0];
  const recent: readonly WpArticle[] = articles.slice(1, 6);
  const rest: readonly WpArticle[] = articles.slice(6);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] bg-[var(--brand-ink)] pt-20">
        <Image
          src="https://images.ctfassets.net/ld5lxu1wipv6/wpMedia-2416/1f24559e31ebb0432e129a604a01046a/IMG_4143-scaled.jpg"
          alt="Stories of Hope"
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="container relative z-10 mx-auto flex min-h-[70vh] flex-col justify-end px-4 pb-16 pt-32 md:justify-center md:pb-0 md:pt-20">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Stories of Hope
            </p>
            <h1 className="mt-5 font-serif text-5xl font-light leading-[1.08] text-white md:text-6xl">
              Meet the mothers we serve
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">
              Every story is a testament to resilience, hope, and the power of community support.
            </p>
          </div>
        </div>
      </section>

      {/* Featured + Recent */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {articles.length === 0 ? (
            <p className="text-muted-foreground">No stories yet. Check back soon.</p>
          ) : (
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Featured Story */}
              <div className="lg:col-span-2">
                {featured && (
                  <StoryCard
                    title={featured.title}
                    slug={featured.slug}
                    excerpt={getExcerpt(featured)}
                    date={featured.date}
                    imageUrl={getImageUrl(featured)}
                    authorName={featured.author?.name}
                    variant="featured"
                  />
                )}
              </div>
              {/* Recent Stories */}
              <div>
                <h2 className="font-serif text-xl">Recent Stories</h2>
                <div className="mt-6 space-y-6">
                  {recent.map((article) => (
                    <StoryCard
                      key={article.slug}
                      title={article.title}
                      slug={article.slug}
                      excerpt={getExcerpt(article)}
                      date={article.date}
                      imageUrl={getImageUrl(article)}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* More Stories Grid */}
      {rest.length > 0 && (
        <section className="bg-secondary py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-normal md:text-4xl">More Stories</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <StoryCard
                  key={article.slug}
                  title={article.title}
                  slug={article.slug}
                  excerpt={getExcerpt(article)}
                  date={article.date}
                  imageUrl={getImageUrl(article)}
                  variant="grid"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTABanner
        title="Inspired by these stories?"
        description="Your gift helps us reach more mothers and save more lives."
        primaryButton={{ text: "Give a Preemie Kit", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "Contact Us", href: "/contact" }}
        variant="warm"
      />
    </>
  );
}
