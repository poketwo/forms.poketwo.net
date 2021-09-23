import { Long, ObjectId } from "bson";
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

export enum SubmissionStatus {
  REVIEW,
  REJECTED,
  ACCEPTED,
}

export type Submission<T = any> = {
  _id: ObjectId;
  form_id: ObjectId;
  user_id: Long;
  user_tag: string;
  email: string | null;
  data: T;
  status?: SubmissionStatus;
};

export type SerializableSubmission<T = any> = {
  _id: string;
  form_id: string;
  user_id: string;
  user_tag: string;
  email: string | null;
  data: T;
  status?: SubmissionStatus;
};

export const makeSerializable = <T = any>(
  submission: Submission<T>
): SerializableSubmission<T> => ({
  ...submission,
  _id: submission._id.toString(),
  form_id: submission.form_id.toString(),
  user_id: submission.user_id.toString(),
});
