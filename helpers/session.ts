import { NextApiRequest, NextApiResponse } from "next";
import { Session, withIronSession } from "next-iron-session";

type NextIronRequest = NextApiRequest & { session: Session };

enum AuthMode {
  REQUIRE_AUTH,
  ANY,
}

export const withSession = (
  handler: (req: NextIronRequest, res: NextApiResponse) => void,
  mode = AuthMode.REQUIRE_AUTH
) => {
  const wrapped = (req: NextIronRequest, res: NextApiResponse) => {
    const authenticated = req.session.get("user") !== undefined;

    if (!authenticated && mode === AuthMode.REQUIRE_AUTH) {
      res.status(401).end();
    }

    return handler(req, res);
  };

  return withIronSession(wrapped, {
    password: process.env.SECRET_KEY,
    cookieName: "apply.poketwo.net",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 2419200,
    },
  });
};
