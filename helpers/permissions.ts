import { Member } from "./types";

const admin = "718006431231508481";
const serverManager = "1219500880534179892";
const botManager = "1219501453240959006";
const moderator1 = "724879492622843944";
const moderator2 = "930346843521556540";

const fullAccessRoles: Record<string, string[]> = {
  "moderator-application": [admin, serverManager],
  "ban-appeal": [admin, serverManager],
  "suspension-appeal": [admin, botManager],
};

const restrictedAccessRoles: Record<string, string[]> = {
  "moderator-application": [moderator1, moderator2],
  "ban-appeal": [moderator1, moderator2],
  "suspension-appeal": [moderator1, moderator2],
};

export const permittedToViewForm = (member: Member, formId: string) => {
  const roles = member.roles ?? [];
  const fullRoles = fullAccessRoles[formId] ?? [];
  const restrictedRoles = restrictedAccessRoles[formId] ?? [];
  return roles.some((role) => [...fullRoles, ...restrictedRoles].includes(role));
};

export const hasFullAccess = (member: Member, formId: string) => {
  const roles = member.roles ?? [];
  const fullRoles = fullAccessRoles[formId] ?? [];
  return roles.some((role) => fullRoles.includes(role));
};
