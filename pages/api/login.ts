import crypto from "crypto";
import { NextApiResponse } from "next";
import absoluteUrl from "next-absolute-url";

import oauth from "~helpers/oauth";
import { AuthMode, NextIronRequest, withSession } from "~helpers/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  let id = req.session.id;

  if (!id) {
    id = crypto.randomBytes(16).toString("hex");
    req.session.id = id;
    await req.session.save();
  }

  const { origin } = absoluteUrl(req);

  const state = crypto.createHash("sha256").update(id).digest("hex");
  const url = oauth.generateAuthUrl({
    state,
    scope: "identify email",
    redirectUri: `${origin}/api/callback`,
  });

  res.redirect(url);
};

export default withSession(handler, AuthMode.NONE);
