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

export const getImageEvidencePreviewUrl = (value: string): string => {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (
    (hostname === "imgur.com" || hostname === "www.imgur.com") &&
    pathParts.length === 1
  ) {
    const match = pathParts[0].match(/^([a-zA-Z0-9]+)(?:\.(gif|jpe?g|png|webp))?$/i);
    if (match) {
      const extension = match[2]?.toLowerCase() ?? "png";
      return `https://i.imgur.com/${match[1]}.${extension}`;
    }
  }

  return value;
};
