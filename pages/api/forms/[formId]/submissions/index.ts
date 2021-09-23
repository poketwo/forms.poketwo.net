import { Long } from "bson";
import { NextApiResponse } from "next";

import { AuthMode, NextIronRequest, withSession } from "helpers/session";

import { createSubmission } from "~helpers/db";
import { User } from "~helpers/types";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { formId } = req.query;
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  if (typeof formId !== "string") return res.status(400).end();

  const user = req.session.get<User>("user");
  if (!user) return res.status(401);

  await createSubmission({
    form_id: formId,
    user_id: Long.fromString(user.id),
    user_tag: `${user.username}#${user.discriminator}`,
    email: user.email,
    data: req.body,
  });

  res.status(204).end();
};

export default withSession(handler, AuthMode.AUTHENTICATED);
