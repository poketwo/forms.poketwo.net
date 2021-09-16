import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { Session, withIronSession } from "next-iron-session";

export type NextIronRequest = NextApiRequest & { session: Session };

export type NextIronGetServerSidePropsContext = GetServerSidePropsContext & {
  req: NextIronRequest;
};

export enum AuthMode {
  REQUIRE_AUTH,
  REQUIRE_NO_AUTH,
  ANY,
}

enum SessionStatus {
  REDIRECT_LOGIN,
  REDIRECT_DASHBOARD,
  CONTINUE,
}

const IRON_CONFIG = {
  password: process.env.SECRET_KEY,
  cookieName: "forms.poketwo.net",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 2419200,
  },
};

const handleRequest = (req: NextIronRequest, mode: AuthMode) => {
  const authenticated = req.session.get("user") !== undefined;

  return !authenticated && mode === AuthMode.REQUIRE_AUTH
    ? SessionStatus.REDIRECT_LOGIN
    : authenticated && mode === AuthMode.REQUIRE_NO_AUTH
    ? SessionStatus.REDIRECT_DASHBOARD
    : SessionStatus.CONTINUE;
};

export const withSession = (
  handler: (req: NextIronRequest, res: NextApiResponse) => void,
  mode = AuthMode.ANY
) => {
  const wrapped = async (req: NextIronRequest, res: NextApiResponse) => {
    const status = handleRequest(req, mode);

    if (status === SessionStatus.REDIRECT_DASHBOARD) {
      return res.redirect("/dashboard");
    } else if (status === SessionStatus.REDIRECT_LOGIN) {
      return res.redirect("/");
    }

    return handler(req, res);
  };
  return withIronSession(wrapped, IRON_CONFIG);
};

export const withServerSideSession = <T extends { [key: string]: any } = { [key: string]: any }>(
  handler: (ctx: NextIronGetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>,
  mode = AuthMode.ANY
) => {
  const wrapped = async (
    ctx: NextIronGetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    const status = handleRequest(ctx.req, mode);

    if (status === SessionStatus.REDIRECT_DASHBOARD) {
      return { redirect: { permanent: false, destination: "/dashboard" } };
    } else if (status === SessionStatus.REDIRECT_LOGIN) {
      return { redirect: { permanent: false, destination: "/" } };
    }

    return handler(ctx);
  };

  return withIronSession(wrapped, IRON_CONFIG);
};
