import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { Session, withIronSession } from "next-iron-session";

import { fetchMember } from "./db";
import { Position, User } from "./types";

export type NextIronRequest = NextApiRequest & { session: Session };

export type NextIronGetServerSidePropsContext = GetServerSidePropsContext & {
  req: NextIronRequest;
};

export enum AuthMode {
  NONE,
  GUEST,
  AUTHENTICATED,
}

enum SessionStatus {
  REDIRECT_LOGIN,
  REDIRECT_DASHBOARD,
  FORBIDDEN,
  CONTINUE,
}

const IRON_CONFIG = {
  password: process.env.SECRET_KEY as string,
  cookieName: "forms.poketwo.net",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 2419200,
  },
};

const handleRequest = async (
  req: NextIronRequest,
  mode: AuthMode,
  position: Position | undefined
) => {
  const user = req.session.get<User>("user");
  const member = user ? await fetchMember(user.id) : undefined;

  if (mode === AuthMode.GUEST && user) return SessionStatus.REDIRECT_DASHBOARD;
  if (mode === AuthMode.AUTHENTICATED && !user) return SessionStatus.REDIRECT_LOGIN;

  if (position) {
    if (!member) return SessionStatus.FORBIDDEN;
    if (member.position < position) return SessionStatus.FORBIDDEN;
  }

  return SessionStatus.CONTINUE;
};

export const withSession = (
  handler: (req: NextIronRequest, res: NextApiResponse) => void,
  mode: AuthMode,
  position?: Position
) => {
  const wrapped = async (req: NextIronRequest, res: NextApiResponse) => {
    const status = await handleRequest(req, mode, position);

    if (status === SessionStatus.REDIRECT_DASHBOARD) {
      return res.redirect("/dashboard");
    } else if (status === SessionStatus.REDIRECT_LOGIN) {
      return res.redirect("/");
    } else if (status === SessionStatus.FORBIDDEN) {
      return res.status(403).end();
    }

    return handler(req, res);
  };
  return withIronSession(wrapped, IRON_CONFIG);
};

export const withServerSideSession = <T extends { [key: string]: any } = { [key: string]: any }>(
  handler: (ctx: NextIronGetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>,
  mode: AuthMode,
  position?: Position
) => {
  const wrapped = async (
    ctx: NextIronGetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    const status = await handleRequest(ctx.req, mode, position);

    if (status === SessionStatus.REDIRECT_DASHBOARD) {
      return { redirect: { permanent: false, destination: "/dashboard" } };
    } else if (status === SessionStatus.REDIRECT_LOGIN) {
      return { redirect: { permanent: false, destination: "/" } };
    } else if (status === SessionStatus.FORBIDDEN) {
      return { redirect: { permanent: false, destination: "/dashboard" } };
    }

    return await handler(ctx);
  };

  return withIronSession(wrapped, IRON_CONFIG);
};
