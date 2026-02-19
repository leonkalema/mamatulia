import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMamatuliaProgram, getMamtuliaProgramSlugs } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { MamatuliaProgram } from "@/types/contentful";
import { CTABanner } from "@/components/brand";
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
      <section className="relative bg-[var(--brand-earth)] pt-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--brand-earth-dark)] via-[var(--brand-earth)] to-[var(--brand-tan)]/30" />
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
          <Link
            href="/programs"
            className="mb-6 inline-flex items-center text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Programs
          </Link>
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            {program.category}
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-normal leading-tight text-white md:text-5xl lg:text-6xl">
            {program.name}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            {program.summary}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 30C1200 50 960 60 720 60C480 60 240 50 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Image */}
      {imageUrl && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl">
              <Image
                src={imageUrl}
                alt={program.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      {paragraphs.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
                {paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
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
