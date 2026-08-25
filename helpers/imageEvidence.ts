export const IMAGE_EVIDENCE_FIELD = "image_evidence";
export const MAX_IMAGE_EVIDENCE_LINKS = 10;

export const isValidImageEvidenceUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const normalizeImageEvidenceLinks = (value: unknown): string[] => {
  const links =
    typeof value === "string"
      ? value.split("\n")
      : Array.isArray(value)
      ? value.filter((link): link is string => typeof link === "string")
      : [];

  return [...new Set(links.map((link) => link.trim()).filter(isValidImageEvidenceUrl))];
};
