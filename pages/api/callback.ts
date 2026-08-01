import crypto from "crypto";
import { NextApiResponse } from "next";
import absoluteUrl from "next-absolute-url";

import oauth from "~helpers/oauth";
import { AuthMode, NextIronRequest, saveSession, withSession } from "~helpers/session";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const id = req.session.id;
  if (!id) return res.status(401).end();

  const { code, state } = req.query;
  const currentState = crypto.createHash("sha256").update(id).digest("hex");
  if (typeof code !== "string" || currentState !== state) return res.status(400).end();

  const { origin } = absoluteUrl(req);
  const token = await oauth.tokenRequest({
    code,
    grantType: "authorization_code",
    scope: "identify email",
    redirectUri: `${origin}/api/callback`,
  });
  const user = await oauth.getUser(token.access_token);

  const next = req.session.next;
  req.session.next = undefined;

  req.session.user = <any>user;
  await saveSession(req.session);

  res.redirect(next ?? "/");
};

export default withSession(handler, AuthMode.NONE);
