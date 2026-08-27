export const VIDEO_EVIDENCE_FIELD = "video_evidence";
export const MAX_VIDEO_EVIDENCE_LINKS = 10;

const VIDEO_EVIDENCE_FORM_IDS = new Set(["ban-appeal", "suspension-appeal"]);

export const supportsVideoEvidence = (formId: string): boolean =>
  VIDEO_EVIDENCE_FORM_IDS.has(formId);

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

const YOUTUBE_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;

export const getYouTubeEmbedUrl = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null | undefined;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0];
    } else if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const pathParts = url.pathname.split("/").filter(Boolean);
      videoId =
        pathParts[0] === "watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(pathParts[0])
          ? pathParts[1]
          : undefined;
    }

    return videoId && YOUTUBE_VIDEO_ID.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : undefined;
  } catch {
    return undefined;
  }
};
