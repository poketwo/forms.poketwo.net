import { fetchPoketwoMember } from "~helpers/db";
import { fetchServerBan } from "~helpers/discord";
import { PoketwoMember, Punishment, PunishmentRecord } from "~helpers/types";

const APPEAL_FORMS = ["ban-appeal", "suspension-appeal"] as const;

export type AppealFormId = (typeof APPEAL_FORMS)[number];

export const isAppealForm = (formId: string): formId is AppealFormId =>
  (APPEAL_FORMS as readonly string[]).includes(formId);

const isActive = (until: Date | null | undefined, now: Date) => !until || until > now;

const suspensionRecord = (
  reason: string | null | undefined,
  until: Date | null | undefined
): PunishmentRecord => ({ reason: reason ?? null, until: until?.toISOString() ?? null });

const memberPunishment = (member: PoketwoMember | undefined): Punishment => {
  const now = new Date();
  const timed = member?.suspended_until;

  let account: PunishmentRecord | null = null;
  if (member?.suspended) account = suspensionRecord(member.suspension_reason, null);
  else if (timed && timed > now) account = suspensionRecord(member?.suspension_reason, timed);

  const network = member?.network_suspension;
  return {
    account,
    network:
      network && isActive(network.until, now)
        ? { kind: network.kind, ...suspensionRecord(network.reason, network.until) }
        : null,
  };
};

export const fetchBanPunishment = async (userId: string): Promise<Punishment> => {
  const ban = await fetchServerBan(userId);
  return { account: ban && { reason: ban.reason, until: null }, network: null };
};

export const fetchSuspensionPunishment = async (userId: string): Promise<Punishment> =>
  memberPunishment(await fetchPoketwoMember(userId, { refresh: true }));

export const fetchPunishment = (formId: AppealFormId, userId: string): Promise<Punishment> =>
  formId === "ban-appeal" ? fetchBanPunishment(userId) : fetchSuspensionPunishment(userId);

export const isPermanent = (record: PunishmentRecord | null) =>
  record !== null && record.until === null;
