import { Member } from "./types";

const admin = "718006431231508481";
const serverManager = "1219500880534179892";
const botManager = "1219501453240959006";
const seniorModerator = "1483963509275623444";

const fullAccessRoles: Record<string, string[]> = {
  "moderator-application": [admin, serverManager],
  "ban-appeal": [admin, serverManager],
  "suspension-appeal": [admin, botManager],
};

const restrictedAccessRoles: Record<string, string[]> = {
  "moderator-application": [seniorModerator],
  "ban-appeal": [seniorModerator],
  "suspension-appeal": [admin],
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

// Forms whose first page holds demographic details, hidden from restricted roles.
const redactedForms = ["moderator-application"];

export const hasFullContentAccess = (member: Member, formId: string) =>
  !redactedForms.includes(formId) || hasFullAccess(member, formId);
