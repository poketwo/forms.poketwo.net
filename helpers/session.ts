import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { Session, withIronSession } from "next-iron-session";
import { ParsedUrlQuery } from "querystring";

import { fetchMember } from "./db";
import { Member, Position, User } from "./types";

const IRON_CONFIG = {
  password: process.env.SECRET_KEY as string,
  cookieName: "forms.poketwo.net",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 2419200,
  },
};

export type NextIronRequest = NextApiRequest & { session: Session };

export type NextIronGetServerSidePropsContext<Q extends ParsedUrlQuery> =
  GetServerSidePropsContext<Q> & {
    req: NextIronRequest;
  };

export type InnerGetServerSidePropsContext<Q extends ParsedUrlQuery> =
  NextIronGetServerSidePropsContext<Q> & {
    user: User;
    member: Member;
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

const addMemberInfo = async (req: NextIronRequest) => {
  const user = req.session.get<User>("user");
  const member = user ? await fetchMember(user.id) : undefined;
  req.session.set("member", member);
  return { user, member };
};

const handleRequest = async (
  user: User | undefined,
  member: Member | undefined,
  mode: AuthMode,
  position: Position | undefined
) => {
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
    const { user, member } = await addMemberInfo(req);
    const status = await handleRequest(user, member, mode, position);

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

export const withServerSideSession = <
  T extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
>(
  handler: (ctx: NextIronGetServerSidePropsContext<Q>) => Promise<GetServerSidePropsResult<T>>,
  mode: AuthMode,
  position?: Position
) => {
  const wrapped = async (
    ctx: NextIronGetServerSidePropsContext<Q>
  ): Promise<GetServerSidePropsResult<T>> => {
    const { user, member } = await addMemberInfo(ctx.req);
    const status = await handleRequest(user, member, mode, position);

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
