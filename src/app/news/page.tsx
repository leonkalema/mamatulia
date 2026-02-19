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
      <section className="relative min-h-[60vh] bg-[var(--brand-earth)] pt-20">
        <Image
          src="https://images.ctfassets.net/ld5lxu1wipv6/wpMedia-2416/1f24559e31ebb0432e129a604a01046a/IMG_4143-scaled.jpg"
          alt="Stories of Hope"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="container relative z-10 mx-auto flex min-h-[60vh] flex-col justify-center px-4 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            Stories of Hope
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-normal leading-tight text-white md:text-5xl lg:text-6xl">
            Meet the mothers we serve
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            Every story is a testament to resilience, hope, and the power of community support.
          </p>
        </div>
        {/* Curved divider */}
        <div className="absolute -bottom-px left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" className="block w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 30C1200 50 960 60 720 60C480 60 240 50 0 30L0 60Z" fill="white" />
          </svg>
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
