import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMamatuliaProgram, getMamtuliaProgramSlugs } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { MamatuliaProgram } from "@/types/contentful";
import { CTABanner } from "@/components/brand";
import { FadeIn } from "@/components/ui/fade-in";
import { EXTERNAL_LINKS } from "@/constants/links";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

type PageProps = {
  readonly params: Promise<{ slug: string }>;
};

const getImageUrl = (asset: unknown): string | null => {
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

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getMamtuliaProgramSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getMamatuliaProgram(slug);
  if (response.error || !response.data) {
    return genMeta({ title: "Program Not Found", canonical: `/programs/${slug}` });
  }
  const program = response.data;
  return genMeta({
    title: program.name,
    description: program.summary,
    canonical: `/programs/${slug}`,
  });
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const response = await getMamatuliaProgram(slug);

  if (response.error || !response.data) {
    notFound();
  }

  const program: MamatuliaProgram = response.data;
  const imageUrl = getImageUrl(program.image);
  const paragraphs = program.description?.split(/\n+/).filter((p) => p.trim().length > 0) ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] bg-[var(--brand-ink)] pt-20">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={program.name}
              fill
              className="object-cover opacity-60"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-ink)] via-[var(--brand-ink-soft)] to-[var(--brand-ink-soft)]/60" />
        )}
        <div className="container relative z-10 mx-auto flex min-h-[70vh] flex-col justify-end px-4 pb-16 pt-32 md:justify-center md:pb-0 md:pt-20">
          <div className="max-w-xl">
            <FadeIn delay={0.05} direction="up">
              <Link
                href="/programs"
                className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white/70"
              >
                <ArrowLeft className="h-3 w-3" />
                All Programs
              </Link>
            </FadeIn>
            <FadeIn delay={0.1} direction="up">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                {program.category}
              </p>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <h1 className="mt-5 font-serif text-5xl font-light leading-[1.08] text-white md:text-6xl">
                {program.name}
              </h1>
            </FadeIn>
            <FadeIn delay={0.35} direction="up">
              <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">
                {program.summary}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Content */}
      {paragraphs.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="mx-auto max-w-3xl">
                <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
                  {paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTABanner
        title={`Support ${program.name}`}
        description="Your donation helps us reach more mothers and save more lives through this program."
        primaryButton={{ text: "Donate Now", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "View All Programs", href: "/programs" }}
        variant="warm"
      />
    </>
  );
}
