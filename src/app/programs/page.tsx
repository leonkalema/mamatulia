import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getMamatuliaPrograms } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { MamatuliaProgram } from "@/types/contentful";
import { CTABanner } from "@/components/brand";
import { FadeIn } from "@/components/ui/fade-in";
import { EXTERNAL_LINKS } from "@/constants/links";
import { Heart, Home, Users, BookOpen, Briefcase, HandHeart, Droplets, Eye, BookHeart } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = genMeta({
  title: "Our Programs",
  description: "Discover how Mama Tulia supports preemie mothers through hospital visits, home visits, discipleship, economic development, and community outreaches.",
  canonical: "/programs",
});

const PROGRAM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "hospital-visits": Heart,
  "home-visits": Home,
  "discipleship-program": BookOpen,
  "economic-development": Briefcase,
  "outreaches": HandHeart,
  "food-relief": Users,
  "purifier-project": Droplets,
  "ropretinopathy-of-prematurity": Eye,
  "stories-of-preemie-moms": BookHeart,
};

const DEFAULT_ICON = Users;

const getImageUrl = (asset: unknown): string | null => {
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

const CATEGORY_LABELS: Record<string, string> = {
  "Core Program": "What We Do",
  "Support Program": "Support Programs",
  "Medical Initiative": "Medical Initiatives",
  "Stories": "Stories",
} as const;

const groupByCategory = (
  programs: readonly MamatuliaProgram[]
): Record<string, readonly MamatuliaProgram[]> => {
  const groups: Record<string, MamatuliaProgram[]> = {};
  for (const program of programs) {
    const cat = program.category || "Core Program";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(program);
  }
  return groups;
};

export default async function ProgramsPage() {
  const response = await getMamatuliaPrograms();
  const programs = response.data?.items ?? [];
  const grouped = groupByCategory(programs);
  const categoryOrder = ["Core Program", "Support Program", "Medical Initiative", "Stories"];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] bg-[var(--brand-ink)] pt-20">
        <Image
          src="https://images.ctfassets.net/ld5lxu1wipv6/wpMedia-3264/e8c95b0b9adbb32792b26ab8b211b99d/IMG-20240909-WA00211.jpg"
          alt="Our Programs"
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="container relative z-10 mx-auto flex min-h-[70vh] flex-col justify-end px-4 pb-16 pt-32 md:justify-center md:pb-0 md:pt-20">
          <div className="max-w-xl">
            <FadeIn delay={0.1} direction="up">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                What We Do
              </p>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <h1 className="mt-5 font-serif text-5xl font-light leading-[1.08] text-white md:text-6xl">
                Our Programs
              </h1>
            </FadeIn>
            <FadeIn delay={0.35} direction="up">
              <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">
                Comprehensive support for preemie mothers — from hospital to home and beyond.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Programs by Category */}
      {categoryOrder.map((category) => {
        const categoryPrograms = grouped[category];
        if (!categoryPrograms || categoryPrograms.length === 0) return null;
        const label = CATEGORY_LABELS[category] || category;

        return (
          <section key={category} className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <FadeIn direction="up">
                <div className="mb-12 text-center">
                  <p className="text-sm font-medium uppercase tracking-wider text-primary">
                    {label}
                  </p>
                </div>
              </FadeIn>
              <div className="space-y-16 md:space-y-24">
                {categoryPrograms.map((program, index) => {
                  const IconComponent = PROGRAM_ICONS[program.slug] || DEFAULT_ICON;
                  const imageUrl = getImageUrl(program.image);
                  const isEven = index % 2 === 0;
                  return (
                    <FadeIn key={program.slug} delay={0.1} direction="up">
                      <ProgramCard
                        program={program}
                        imageUrl={imageUrl}
                        icon={IconComponent}
                        isEven={isEven}
                      />
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <CTABanner
        title="Support Our Programs"
        description="Your donation helps us reach more mothers and save more lives through these vital programs."
        primaryButton={{ text: "Donate Now", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "Contact Us", href: "/contact" }}
        variant="warm"
      />
    </>
  );
}

type ProgramCardProps = {
  readonly program: MamatuliaProgram;
  readonly imageUrl: string | null;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly isEven: boolean;
};

function ProgramCard({ program, imageUrl, icon: IconComponent, isEven }: ProgramCardProps) {
  // Show first ~300 chars of description as a preview
  const descriptionPreview = program.description
    ? program.description.slice(0, 300) + (program.description.length > 300 ? "..." : "")
    : "";

  return (
    <div className={`grid gap-8 lg:grid-cols-2 lg:gap-16 ${isEven ? "" : "lg:flex-row-reverse"}`}>
      <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary ${isEven ? "" : "lg:order-2"}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={program.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--brand-beige)] to-[var(--brand-beige-dark)]">
            <IconComponent className="h-24 w-24 text-primary/30" />
          </div>
        )}
      </div>
      <div className={`flex flex-col justify-center ${isEven ? "" : "lg:order-1"}`}>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-normal md:text-3xl">
          {program.name}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {program.summary}
        </p>
        {descriptionPreview && (
          <p className="mt-4 text-foreground/80">
            {descriptionPreview}
          </p>
        )}
        <Link
          href={`/programs/${program.slug}`}
          className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}
