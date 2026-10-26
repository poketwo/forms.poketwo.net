import { Member } from "./types";

const admin = "718006431231508481";
const serverManager = "1219500880534179892";
const botManager = "1219501453240959006";
const manager = "1556701034921992322";
const trialManager = "1483963509275623444";

const fullAccessRoles: Record<string, string[]> = {
  "moderator-application": [admin, serverManager],
  "ban-appeal": [admin, serverManager, manager],
  "suspension-appeal": [admin, botManager],
};

const restrictedAccessRoles: Record<string, string[]> = {
  "moderator-application": [manager, trialManager],
  "suspension-appeal": [admin],
};

const viewOnlyRoles: Record<string, string[]> = {
  "ban-appeal": [trialManager],
};

export const permittedToViewForm = (member: Member, formId: string) => {
  const roles = member.roles ?? [];
  const fullRoles = fullAccessRoles[formId] ?? [];
  const restrictedRoles = restrictedAccessRoles[formId] ?? [];
  const viewRoles = viewOnlyRoles[formId] ?? [];
  return roles.some((role) => [...fullRoles, ...restrictedRoles, ...viewRoles].includes(role));
};

export const canFlagSubmissions = (member: Member, formId: string) => {
  const roles = member.roles ?? [];
  const flagRoles = [...(fullAccessRoles[formId] ?? []), ...(restrictedAccessRoles[formId] ?? [])];
  return roles.some((role) => flagRoles.includes(role));
};

export const hasFullAccess = (member: Member, formId: string) => {
  const roles = member.roles ?? [];
  const fullRoles = fullAccessRoles[formId] ?? [];
  return roles.some((role) => fullRoles.includes(role));
};

// Forms whose first page holds demographic details, hidden from non-full-access roles.
const redactedForms = ["moderator-application"];

export const hasFullContentAccess = (member: Member, formId: string) =>
  !redactedForms.includes(formId) || hasFullAccess(member, formId);
