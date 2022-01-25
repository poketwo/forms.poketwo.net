import { Long } from "mongodb";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";

import { updateSubmission } from "~helpers/db";
import { Position, User } from "~helpers/types";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { formId, submissionId } = req.query;
  if (req.method !== "PATCH") return res.status(405).send("Method not allowed");
  if (typeof formId !== "string") return res.status(400).end();
  if (typeof submissionId !== "string") return res.status(400).end();

  const user = req.session.get<User>("user");
  if (!user) return res.status(401);

  await updateSubmission(submissionId, {
    $set: { status: req.body.status, reviewer_id: Long.fromString(user.id) },
  });

  res.status(204).end();
};

export default withSession(handler, AuthMode.AUTHENTICATED, Position.COMMUNITY_MANAGER);
