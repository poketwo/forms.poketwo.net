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

export type NetworkSuspension = {
  kind: string;
  reason?: string | null;
  until?: Date | null;
};

export type RawPoketwoMember = {
  _id: Long;
  suspended?: boolean;
  suspended_until?: Date;
  suspension_reason?: string | null;
  network_suspension?: NetworkSuspension | null;
};

export type PoketwoMember = Omit<RawPoketwoMember, "_id"> & {
  _id: string;
};

export type PunishmentRecord = {
  reason: string | null;
  // ISO timestamp; null means permanent.
  until: string | null;
};

export type Punishment = {
  account: PunishmentRecord | null;
  network: (PunishmentRecord & { kind: string }) | null;
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
  MARKED_RED = 7,
}

export const FLAG_STATUSES = [
  SubmissionStatus.MARKED_ORANGE,
  SubmissionStatus.MARKED_YELLOW,
  SubmissionStatus.MARKED_BLUE,
  SubmissionStatus.MARKED_PURPLE,
  SubmissionStatus.MARKED_RED,
];

export const isFlagStatus = (status: SubmissionStatus) => FLAG_STATUSES.includes(status);

export const FLAG_COLORS: { [key in SubmissionStatus]: string } = {
  [SubmissionStatus.UNDER_REVIEW]: "gray",
  [SubmissionStatus.ACCEPTED]: "gray",
  [SubmissionStatus.REJECTED]: "gray",
  [SubmissionStatus.MARKED_ORANGE]: "orange",
  [SubmissionStatus.MARKED_YELLOW]: "yellow",
  [SubmissionStatus.MARKED_BLUE]: "blue",
  [SubmissionStatus.MARKED_PURPLE]: "purple",
  [SubmissionStatus.MARKED_RED]: "red",
};

// Staff-only: never include these in makeSerializable, which appellant pages also use.
export type SubmissionNote = {
  author_id: Long;
  author_tag: string;
  status: SubmissionStatus;
  text: string;
  created_at: Date;
};

export type SerializableSubmissionNote = {
  author_id: string;
  author_tag: string;
  status: SubmissionStatus;
  text: string;
  created_at: string;
};

export const makeSerializableNote = (note: SubmissionNote): SerializableSubmissionNote => ({
  author_id: note.author_id.toString(),
  author_tag: note.author_tag,
  status: note.status,
  text: note.text,
  created_at: note.created_at.toISOString(),
});

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
  punishment?: Punishment;
  notes?: SubmissionNote[];
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
