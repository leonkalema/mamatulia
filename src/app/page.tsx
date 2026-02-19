import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Users, Baby, BookOpen, Home as HomeIcon, HandHeart, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EXTERNAL_LINKS } from "@/constants/links";
import { ImpactStat, ProgramCard, DonationModule, CTABanner } from "@/components/brand";
import { getWpArticles, getMamatuliaPrograms, getMamatuliaPartners, getHomepageHero } from "@/services/contentful";
import { StoryCard } from "@/components/brand/story-card";
import type { WpArticle, MamatuliaProgram, MamatuliaPartner, HomepageHero } from "@/types/contentful";

const impactStats = [
  { value: "31,200+", label: "Home visits & outreaches", icon: Heart },
  { value: "1,600", label: "Preemie kits distributed", icon: Baby },
  { value: "11,500", label: "Mothers supported", icon: Users },
  { value: "6,450", label: "Trainings delivered", icon: BookOpen },
] as const;

const PROGRAM_ICONS: Record<string, LucideIcon> = {
  "hospital-visits": Heart,
  "home-visits": HomeIcon,
  "discipleship-program": BookOpen,
  "economic-development": Briefcase,
  "outreaches": HandHeart,
};

const CARD_COLORS = [
  "bg-[var(--brand-tan)]",
  "bg-[var(--brand-earth)]",
  "bg-[var(--brand-earth-dark)]",
] as const;

const getAssetUrl = (asset: unknown): string | null => {
  if (!asset || typeof asset !== "object") return null;
  const fields = (asset as Record<string, unknown>).fields as Record<string, unknown> | undefined;
  if (fields && typeof fields === "object") {
    const file = fields.file as Record<string, unknown> | undefined;
    if (file && typeof file.url === "string") {
      return file.url.startsWith("//") ? `https:${file.url}` : file.url;
    }
  }
  return null;
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
  return null;
};

const getExcerpt = (article: WpArticle): string => {
  const raw: string = article.excerptHtml || article.bodyHtml || "";
  const text: string = raw.replace(/<[^>]*>/g, "").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

export default async function Home() {
  const [storiesResponse, programsResponse, partnersResponse, heroResponse] = await Promise.all([
    getWpArticles({ limit: 3 }),
    getMamatuliaPrograms(),
    getMamatuliaPartners(),
    getHomepageHero(),
  ]);
  const stories: readonly WpArticle[] = storiesResponse.data?.items || [];
  const featuredStory: WpArticle | undefined = stories[0];
  const corePrograms: readonly MamatuliaProgram[] = (programsResponse.data?.items || [])
    .filter((p) => p.category === "Core Program")
    .slice(0, 3);
  const partners: readonly MamatuliaPartner[] = partnersResponse.data || [];
  const hero: HomepageHero | null = heroResponse.data;
  const heroImageUrl = getAssetUrl(hero?.heroImage);
  const isExternalUrl = (url: string): boolean => url.startsWith("http");

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] bg-[var(--brand-earth)] pt-20">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={hero?.headline || ""}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 z-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--brand-earth-dark)] via-[var(--brand-earth)] to-[var(--brand-tan)]/30" />
        )}
        <div className="container relative z-10 mx-auto flex min-h-[85vh] flex-col justify-center px-4 py-24">
          <div className="max-w-2xl">
            {hero?.tagline && (
              <p className="text-sm font-medium uppercase tracking-wider text-white/70">
                {hero.tagline}
              </p>
            )}
            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.1] text-white md:text-5xl lg:text-6xl">
              {hero?.headline || "Every preemie deserves a fighting chance"}
            </h1>
            {hero?.subtext && (
              <p className="mt-6 max-w-lg text-lg text-white/80">
                {hero.subtext}
              </p>
            )}
            <div className="mt-10 flex flex-wrap gap-4">
              {hero?.primaryButtonText && hero.primaryButtonUrl && (
                <Button asChild size="lg" className="rounded-full px-8 text-base">
                  {isExternalUrl(hero.primaryButtonUrl) ? (
                    <a href={hero.primaryButtonUrl} target="_blank" rel="noopener noreferrer">
                      {hero.primaryButtonText}
                    </a>
                  ) : (
                    <Link href={hero.primaryButtonUrl}>{hero.primaryButtonText}</Link>
                  )}
                </Button>
              )}
              {hero?.secondaryButtonText && hero.secondaryButtonUrl && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white hover:text-foreground"
                >
                  {isExternalUrl(hero.secondaryButtonUrl) ? (
                    <a href={hero.secondaryButtonUrl} target="_blank" rel="noopener noreferrer">
                      {hero.secondaryButtonText}
                    </a>
                  ) : (
                    <Link href={hero.secondaryButtonUrl}>{hero.secondaryButtonText}</Link>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 80L1440 80L1440 40C1200 70 960 80 720 80C480 80 240 70 0 40L0 80Z" fill="var(--brand-beige)" />
          </svg>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {impactStats.map((stat) => (
              <ImpactStat key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              What We Do
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal md:text-4xl">
              Programs that save lives
            </h2>
            <p className="mt-4 text-muted-foreground">
              From hospital bedsides to home visits, we provide comprehensive support for preemie mothers and their babies.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {corePrograms.map((program, i) => (
              <ProgramCard
                key={program.slug}
                title={program.name}
                description={program.summary}
                href={`/programs/${program.slug}`}
                icon={PROGRAM_ICONS[program.slug]}
                imageUrl={getAssetUrl(program.image)}
                color={CARD_COLORS[i % CARD_COLORS.length]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story + Donation */}
      <section className="bg-secondary py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Featured Story */}
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Stories of Hope
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal md:text-4xl">
                Meet the mothers we serve
              </h2>
              {featuredStory ? (
                <div className="mt-8">
                  <StoryCard
                    title={featuredStory.title}
                    slug={featuredStory.slug}
                    excerpt={getExcerpt(featuredStory)}
                    date={featuredStory.date}
                    imageUrl={getImageUrl(featuredStory)}
                    authorName={featuredStory.author?.name}
                    variant="featured"
                  />
                </div>
              ) : (
                <p className="mt-8 text-muted-foreground">Stories coming soon.</p>
              )}
              <Link
                href="/news"
                className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Read all stories →
              </Link>
            </div>

            {/* Donation Module */}
            <div className="flex items-center">
              <DonationModule className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mx-auto max-w-2xl font-serif text-xl leading-relaxed text-foreground/80 md:text-2xl">
            &ldquo;By God&apos;s grace, we support mothers, save lives, and strengthen faith.&rdquo;
          </p>
        </div>
      </section>

      {/* Partners */}
      <section className="border-t py-12">
        <div className="container mx-auto px-4">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner) => {
              const logoUrl = getAssetUrl(partner.logo);
              if (!logoUrl) return null;
              const wrapper = partner.website ? (
                <a
                  key={partner.slug}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-10 w-24 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 md:h-12 md:w-32"
                  title={partner.name}
                >
                  <Image
                    src={logoUrl}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </a>
              ) : (
                <div
                  key={partner.slug}
                  className="relative h-10 w-24 opacity-60 grayscale md:h-12 md:w-32"
                  title={partner.name}
                >
                  <Image
                    src={logoUrl}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              );
              return wrapper;
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to make a difference?"
        description="Your support helps us continue our mission of empowering preemie mothers and saving lives."
        primaryButton={{ text: "Donate Now", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "Contact Us", href: "/contact" }}
        variant="warm"
      />
    </>
  );
}
