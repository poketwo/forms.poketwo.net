const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const POKETWO_GUILD_ID = "716390832034414685";

export const fetchServerBan = async (userId: string): Promise<boolean> => {
  const token = process.env.GUIDUCK_BOT_TOKEN;
  if (!token) throw new Error("GUIDUCK_BOT_TOKEN is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let response: Response;
  try {
    response = await fetch(
      `${DISCORD_API_BASE_URL}/guilds/${POKETWO_GUILD_ID}/bans/${userId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  const status = response.status;
  await response.body?.cancel();

  if (status === 200) return true;
  if (status === 404) return false;

  throw new Error(`Discord ban lookup failed with status ${status}`);
};
