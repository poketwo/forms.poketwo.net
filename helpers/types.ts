import { NextApiRequest } from "next";
import { Session } from "next-iron-session";

export type NextIronRequest = NextApiRequest & { session: Session };

export type User = {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string;
  banner_color: string | null;
  accent_color: string | null;
  locale: string | null;
  mfa_enabled: boolean;
  premium_type: number;
  email: string | null;
  verified: boolean;
};
