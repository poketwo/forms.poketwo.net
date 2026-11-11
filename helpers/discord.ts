const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const POKETWO_GUILD_ID = "716390832034414685";

const fetchDiscord = async (path: string) => {
  const token = process.env.GUIDUCK_BOT_TOKEN;
  if (!token) throw new Error("GUIDUCK_BOT_TOKEN is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    return await fetch(`${DISCORD_API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export type ServerBan = { reason: string | null };

// Returns null if the user isn't banned.
export const fetchServerBan = async (userId: string): Promise<ServerBan | null> => {
  const response = await fetchDiscord(`/guilds/${POKETWO_GUILD_ID}/bans/${userId}`);

  if (response.status === 200) {
    const data: ServerBan = await response.json();
    return { reason: data.reason };
  }

  const status = response.status;
  await response.body?.cancel();

  if (status === 404) return null;

  throw new Error(`Discord ban lookup failed with status ${status}`);
};

// Live roles, since guiduck's member cache doesn't track role changes without the members intent.
// Returns null if the user isn't in the server.
export const fetchServerMemberRoles = async (userId: string): Promise<string[] | null> => {
  const response = await fetchDiscord(`/guilds/${POKETWO_GUILD_ID}/members/${userId}`);

  if (response.status === 200) {
    const data: { roles: string[] } = await response.json();
    return data.roles;
  }

  const status = response.status;
  await response.body?.cancel();

  if (status === 404) return null;

  throw new Error(`Discord member lookup failed with status ${status}`);
};
type DiscordUser = { username: string; discriminator: string };

// Discord has no deleted flag; deleted accounts get a placeholder username instead.
const DELETED_USERNAME = /^deleted_user_[0-9a-f]+$/;
const LEGACY_DELETED_USERNAME_PREFIX = "Deleted User";
const LEGACY_DELETED_DISCRIMINATOR = "0000";

const isDeletedUser = (user: DiscordUser) =>
  DELETED_USERNAME.test(user.username) ||
  (user.username.startsWith(LEGACY_DELETED_USERNAME_PREFIX) &&
    user.discriminator === LEGACY_DELETED_DISCRIMINATOR);

export const fetchAccountDeleted = async (userId: string): Promise<boolean> => {
  const response = await fetchDiscord(`/users/${userId}`);

  if (!response.ok) {
    const status = response.status;
    await response.body?.cancel();
    throw new Error(`Discord user lookup failed with status ${status}`);
  }

  return isDeletedUser(await response.json());
};
