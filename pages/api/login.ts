import crypto from "crypto";
import { NextApiResponse } from "next";
import absoluteUrl from "next-absolute-url";

import oauth from "~helpers/oauth";
import { withSession } from "~helpers/session";
import { NextIronRequest } from "~helpers/types";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  let id = req.session.get("id");

  if (!id) {
    id = crypto.randomBytes(16).toString("hex");
    req.session.set("id", id);
    await req.session.save();
  }

  const { origin } = absoluteUrl(req);

  const state = crypto.createHash("sha256").update(id).digest("hex");
  const url = oauth.generateAuthUrl({
    state,
    scope: "identify",
    redirectUri: `${origin}/api/callback`,
  });

  res.redirect(url);
};

export default withSession(handler);
