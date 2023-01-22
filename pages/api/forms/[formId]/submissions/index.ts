import sendgrid from "@sendgrid/mail";
import { Long } from "mongodb";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";

import { createSubmission } from "~helpers/db";
import { formium } from "~helpers/formium";
import { Submission, User } from "~helpers/types";

sendgrid.setApiKey(process.env.SENDGRID_KEY as string);

const sendEmail = async (submission: Submission, formId: string) => {
  if (!submission.email) return;

  let form;
  try {
    form = await formium.getFormBySlug(formId);
  } catch {
    return;
  }

  await sendgrid.send({
    to: submission.email,
    from: "Pokétwo <noreply@poketwo.net>",
    templateId: "d-2eceed634947494e93093a311b88efc9",
    dynamicTemplateData: {
      user: submission.user_tag,
      form: form.name,
    },
  });
};

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { formId } = req.query;
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  if (typeof formId !== "string") return res.status(400).end();

  const user = req.session.get<User>("user");
  if (!user) return res.status(401);

  const _submission = {
    form_id: formId,
    user_id: Long.fromString(user.id),
    user_tag: `${user.username}#${user.discriminator}`,
    email: user.email,
    data: req.body,
  };

  const { insertedId } = await createSubmission(_submission);
  const submission: Submission = { _id: insertedId, ..._submission };
  await sendEmail(submission, formId);

  res.status(204).end();
};

export default withSession(handler, AuthMode.AUTHENTICATED);
