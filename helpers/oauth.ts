import DiscordOAuth2 from "discord-oauth2";

const oauth = new DiscordOAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
});

export default oauth;
