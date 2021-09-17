import crypto from "crypto";
import { NextApiResponse } from "next";
import absoluteUrl from "next-absolute-url";

import oauth from "~helpers/oauth";
import { AuthMode, withSession } from "~helpers/session";
import { NextIronRequest } from "~helpers/types";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const id = req.session.get("id");
  if (!id) res.status(401);

  const { code, state } = req.query;
  const currentState = crypto.createHash("sha256").update(id).digest("hex");
  if (typeof code !== "string" || currentState !== state) {
    res.status(400);
    return;
  }

  const { origin } = absoluteUrl(req);
  const token = await oauth.tokenRequest({
    code,
    grantType: "authorization_code",
    scope: "identify email",
    redirectUri: `${origin}/api/callback`,
  });
  const user = await oauth.getUser(token.access_token);

  const next = req.session.get<string>("next");
  req.session.unset("next");

  req.session.set("token", token);
  req.session.set("user", user);
  await req.session.save();

  res.redirect(next ?? "/");
};

export default withSession(handler, AuthMode.NONE);
