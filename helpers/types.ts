import { Long } from "bson";
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

export type RawMember = {
  _id: Long;
  muted?: boolean;
  trading_muted?: boolean;
  roles?: Long[];
};

export type Member = {
  _id: string;
  muted?: boolean;
  trading_muted?: boolean;
  roles?: string[];
  position: Position;
};

export enum Position {
  MEMBER = 0,
  HELPER = 1,
  MODERATOR = 2,
  ADMIN = 3,
}
