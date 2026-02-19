import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/contentful";

type TeamCardProps = {
  readonly member: TeamMember;
  readonly className?: string;
};

const getImageUrl = (member: TeamMember): string | null => {
  const asset = member.photo as unknown;
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

export function TeamCard({ member, className }: TeamCardProps) {
  const imageUrl = getImageUrl(member);

  return (
    <div className={cn("text-center", className)}>
      <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-full bg-secondary md:w-40">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="160px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-3xl text-muted-foreground">
              {member.name[0]}
            </span>
          </div>
        )}
      </div>
      <h3 className="mt-4 font-semibold">{member.name}</h3>
      <p className="text-sm text-primary">{member.role}</p>
      {member.bio && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{member.bio}</p>
      )}
    </div>
  );
}
