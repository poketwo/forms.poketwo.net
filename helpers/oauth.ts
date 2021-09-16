import DiscordOAuth2 from "discord-oauth2";

const oauth = new DiscordOAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
});

export default oauth;
