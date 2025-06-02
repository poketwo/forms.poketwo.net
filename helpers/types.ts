import { Long, ObjectId } from "bson";

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
};

export type RawPoketwoMember = {
  _id: Long;
  suspended?: boolean;
};

export type PoketwoMember = {
  _id: string;
  suspended?: boolean;
};

export enum Position {
  MEMBER = 0,
  HELPER = 1,
  MODERATOR = 2,
  COMMUNITY_MANAGER = 3,
  ADMIN = 4,
}

export enum SubmissionStatus {
  UNDER_REVIEW = 0,
  REJECTED = 1,
  ACCEPTED = 2,
  MARKED_ORANGE = 4,
  MARKED_YELLOW = 5,
  MARKED_BLUE = 3,
  MARKED_PURPLE = 6,
}

export type Submission<T = any> = {
  _id: ObjectId;
  form_id: string;
  user_id: Long;
  user_tag: string;
  email: string | null;
  data: T;
  status?: SubmissionStatus;
  embedded_id?: Long;
  reviewer_id?: Long;
  comment?: string;
};

export type SerializableSubmission<T = any> = {
  _id: string;
  form_id: string;
  user_id: string;
  user_tag: string;
  email: string | null;
  data: T;
  status: SubmissionStatus | null;
  reviewer_id: string | null;
  comment: string | null;
};

export const makeSerializable = <T = any>(
  submission: Submission<T>
): SerializableSubmission<T> => ({
  _id: submission._id.toString(),
  form_id: submission.form_id.toString(),
  user_id: submission.user_id.toString(),
  user_tag: submission.user_tag,
  email: submission.email,
  data: submission.data,
  status: submission.status ?? null,
  reviewer_id: submission.reviewer_id?.toString() ?? null,
  comment: submission.comment ?? null,
});
