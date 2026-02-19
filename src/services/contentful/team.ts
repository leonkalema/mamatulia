import { fetchEntries } from "./base";
import type { TeamMember } from "@/types/contentful";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { CONTENTFUL, CACHE } from "@/constants";

export async function getTeamMembers(
  preview = false
): Promise<ApiResponse<PaginatedResponse<TeamMember>>> {
  return fetchEntries<TeamMember>(
    CONTENTFUL.CONTENT_TYPES.TEAM_MEMBER,
    { limit: 50, order: "fields.sortOrder" },
    preview
  );
}

export const teamRevalidate = CACHE.REVALIDATE_SECONDS;
