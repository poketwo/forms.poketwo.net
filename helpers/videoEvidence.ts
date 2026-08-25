export const VIDEO_EVIDENCE_FIELD = "video_evidence";
export const MAX_VIDEO_EVIDENCE_LINKS = 10;

export const isValidVideoEvidenceUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const normalizeVideoEvidenceLinks = (value: unknown): string[] => {
  const links =
    typeof value === "string"
      ? value.split("\n")
      : Array.isArray(value)
      ? value.filter((link): link is string => typeof link === "string")
      : [];

  return [...new Set(links.map((link) => link.trim()).filter(isValidVideoEvidenceUrl))];
};
