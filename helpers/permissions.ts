import { Member } from "./types";

const admin = "718006431231508481";
const serverManager = "1219500880534179892";
const botManager = "1219501453240959006";

const permittedRoles: Record<string, string[]> = {
  "moderator-application": [admin, serverManager],
  "ban-appeal": [admin, serverManager],
  "suspension-appeal": [admin, botManager],
};

export const permittedToViewForm = (member: Member, formId: string) => {
  const roles = member.roles ?? [];
  const permittedRolesForForm = permittedRoles[formId] ?? [];
  return roles.some((role) => permittedRolesForForm.includes(role));
};
