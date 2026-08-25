import sendgrid from "@sendgrid/mail";
import { Long } from "mongodb";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";
import { createSubmission } from "~helpers/db";
import { formium } from "~helpers/formium";
import {
  IMAGE_EVIDENCE_FIELD,
  MAX_IMAGE_EVIDENCE_LINKS,
  isValidImageEvidenceUrl,
  normalizeImageEvidenceLinks,
} from "~helpers/imageEvidence";
import { Submission } from "~helpers/types";

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

  const user = req.session.user;
  if (!user) return res.status(401);

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).send("Invalid submission data");
  }

  const rawImageEvidence = req.body[IMAGE_EVIDENCE_FIELD];
  if (rawImageEvidence !== undefined) {
    if (
      !["ban-appeal", "suspension-appeal"].includes(formId) ||
      !Array.isArray(rawImageEvidence) ||
      rawImageEvidence.length > MAX_IMAGE_EVIDENCE_LINKS ||
      rawImageEvidence.some(
        (link) => typeof link !== "string" || !isValidImageEvidenceUrl(link.trim())
      )
    ) {
      return res.status(400).send("Invalid image evidence links");
    }
  }

  const imageEvidence = normalizeImageEvidenceLinks(rawImageEvidence);
  const data = { ...req.body };
  if (imageEvidence.length > 0) {
    data[IMAGE_EVIDENCE_FIELD] = imageEvidence;
  } else {
    delete data[IMAGE_EVIDENCE_FIELD];
  }

  const _submission = {
    form_id: formId,
    user_id: Long.fromString(user.id),
    user_tag: `${user.username}#${user.discriminator}`,
    email: user.email,
    data,
  };

  const { insertedId } = await createSubmission(_submission);
  const submission: Submission = { _id: insertedId, ..._submission };
  await sendEmail(submission, formId);

  res.status(204).end();
};

export default withSession(handler, AuthMode.AUTHENTICATED);
