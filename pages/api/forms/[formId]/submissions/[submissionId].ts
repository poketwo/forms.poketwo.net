import sendgrid from "@sendgrid/mail";
import { Long } from "mongodb";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";
import { fetchSubmission, updateSubmission } from "~helpers/db";
import { isEnabledForm } from "~helpers/form";
import { formium } from "~helpers/formium";
import { hasFullAccess, permittedToViewForm } from "~helpers/permissions";
import {
  Submission,
  SubmissionNote,
  SubmissionStatus,
  isFlagStatus,
  makeSerializableNote,
} from "~helpers/types";

const MAX_NOTE_LENGTH = 2000;

sendgrid.setApiKey(process.env.SENDGRID_KEY as string);

const EMAIL_UPDATES: { [key: number]: string } = {
  [SubmissionStatus.ACCEPTED]: "Accepted",
  [SubmissionStatus.REJECTED]: "Rejected",
};

const sendEmail = async (
  submission: Submission,
  formId: string,
  status: number,
  comment: string
) => {
  if (!submission.email) return;
  if (!(status in EMAIL_UPDATES)) return;

  let form;
  try {
    form = await formium.getFormBySlug(formId);
  } catch {
    return;
  }

  await sendgrid.send({
    to: submission.email,
    from: "Pokétwo <noreply@poketwo.net>",
    templateId: "d-f5c582010b5a49368bbd391f50fcc393",
    dynamicTemplateData: {
      user: submission.user_tag,
      form: form.name,
      status: EMAIL_UPDATES[status],
      comment,
    },
  });
};

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { formId, submissionId } = req.query;
  if (req.method !== "PATCH") return res.status(405).send("Method not allowed");
  if (typeof formId !== "string") return res.status(400).end();
  if (!isEnabledForm(formId)) return res.status(404).end();
  if (typeof submissionId !== "string") return res.status(400).end();

  if (typeof req.body.status !== "number") return res.status(400).end();

  const rawNote: unknown = req.body.note;
  if (rawNote != null && typeof rawNote !== "string") return res.status(400).end();
  const noteText = rawNote?.trim() ?? "";
  if (noteText && !isFlagStatus(req.body.status)) return res.status(400).end();
  if (noteText.length > MAX_NOTE_LENGTH) return res.status(400).end();

  const user = req.session.user;
  const member = req.session.member;
  if (!user || !member) return res.status(401);

  const full = hasFullAccess(member, formId);
  const permitted = permittedToViewForm(member, formId);

  if (!permitted) return res.status(403).end();
  if (!full && !isFlagStatus(req.body.status)) return res.status(403).end();

  const submission = await fetchSubmission(submissionId);
  if (!submission) return res.status(404);

  let update: any = { status: req.body.status, reviewer_id: Long.fromString(user.id) };
  if (req.body.comment) {
    update = { ...update, comment: req.body.comment };
  }

  const note: SubmissionNote | null = noteText
    ? {
        author_id: Long.fromString(user.id),
        author_tag: user.username,
        status: req.body.status,
        text: noteText,
        created_at: new Date(),
      }
    : null;

  await updateSubmission(submissionId, note ? { $set: update, $push: { notes: note } } : { $set: update });
  await sendEmail(submission, formId, req.body.status, req.body.comment ?? "No comment provided.");

  res.status(200).json({ note: note && makeSerializableNote(note) });
};

export default withSession(handler, AuthMode.AUTHENTICATED);
