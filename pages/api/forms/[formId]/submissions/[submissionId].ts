import sendgrid from "@sendgrid/mail";
import { Long } from "mongodb";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";
import { fetchSubmission, updateSubmission } from "~helpers/db";
import { formium } from "~helpers/formium";
import { permittedToViewForm } from "~helpers/permissions";
import { Submission, SubmissionStatus } from "~helpers/types";

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
  if (typeof submissionId !== "string") return res.status(400).end();

  if (typeof req.body.status !== "number") return res.status(400).end();

  const user = req.session.user;
  const member = req.session.member;
  if (!user || !member) return res.status(401);

  if (!permittedToViewForm(member, formId)) return res.status(403).end();

  const submission = await fetchSubmission(submissionId);
  if (!submission) return res.status(404);

  let update: any = { status: req.body.status, reviewer_id: Long.fromString(user.id) };
  if (req.body.comment) {
    update = { ...update, comment: req.body.comment };
  }

  await updateSubmission(submissionId, { $set: update });
  await sendEmail(submission, formId, req.body.status, req.body.comment ?? "No comment provided.");

  res.status(204).end();
};

export default withSession(handler, AuthMode.AUTHENTICATED);
