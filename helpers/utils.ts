export const delay = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const DEFAULT_AVATAR_COUNT = 6;
const LEGACY_DEFAULT_AVATAR_COUNT = 5;
const SNOWFLAKE_TIMESTAMP_SHIFT = 22;

// Users on Discord's new username system have discriminator "0" and no tag suffix.
export const hasLegacyDiscriminator = (discriminator?: string | null): discriminator is string =>
  !!discriminator && discriminator !== "0";

export const formatTag = (username: string, discriminator?: string | null) =>
  hasLegacyDiscriminator(discriminator) ? `${username}#${discriminator}` : username;

export const formatUserTag = (userTag: string) => {
  const [username, discriminator] = userTag.split("#", 2);
  return formatTag(username, discriminator);
};

export const defaultAvatarUrl = (userId: string, discriminator?: string | null) => {
  const index = hasLegacyDiscriminator(discriminator)
    ? Number(discriminator) % LEGACY_DEFAULT_AVATAR_COUNT
    : Number((BigInt(userId) >> BigInt(SNOWFLAKE_TIMESTAMP_SHIFT)) % BigInt(DEFAULT_AVATAR_COUNT));
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
};
