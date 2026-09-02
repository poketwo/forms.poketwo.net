import sendgrid from "@sendgrid/mail";
import { Long } from "mongodb";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";
import { createSubmission, fetchPoketwoMember } from "~helpers/db";
import { fetchServerBan } from "~helpers/discord";
import { formium } from "~helpers/formium";
import { Submission } from "~helpers/types";
import {
  MAX_VIDEO_EVIDENCE_LINKS,
  VIDEO_EVIDENCE_FIELD,
  isValidVideoEvidenceUrl,
  normalizeVideoEvidenceLinks,
  supportsVideoEvidence,
} from "~helpers/videoEvidence";

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

  if (formId === "ban-appeal") {
    let serverBanned;
    try {
      serverBanned = await fetchServerBan(user.id);
    } catch {
      return res.status(503).send("Unable to verify your Discord ban status");
    }

    if (!serverBanned) {
      return res.status(403).send("You can only submit a ban appeal if you are banned");
    }
  }

  if (formId === "suspension-appeal") {
    const member = await fetchPoketwoMember(user.id, { refresh: true });
    if (!member?.suspended) {
      return res.status(403).send("You can only submit a suspension appeal if you are suspended");
    }
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).send("Invalid submission data");
  }

  const rawVideoEvidence = req.body[VIDEO_EVIDENCE_FIELD];
  if (rawVideoEvidence !== undefined) {
    if (
      !supportsVideoEvidence(formId) ||
      !Array.isArray(rawVideoEvidence) ||
      rawVideoEvidence.length > MAX_VIDEO_EVIDENCE_LINKS ||
      rawVideoEvidence.some(
        (link) => typeof link !== "string" || !isValidVideoEvidenceUrl(link.trim())
      )
    ) {
      return res.status(400).send("Invalid video evidence links");
    }
  }

  const videoEvidence = normalizeVideoEvidenceLinks(rawVideoEvidence);
  const data = { ...req.body };
  if (videoEvidence.length > 0) {
    data[VIDEO_EVIDENCE_FIELD] = videoEvidence;
  } else {
    delete data[VIDEO_EVIDENCE_FIELD];
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
