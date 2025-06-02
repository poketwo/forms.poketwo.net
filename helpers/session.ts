import { TokenRequestResult } from "discord-oauth2";
import { IronSession, getIronSession } from "iron-session";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { ParsedUrlQuery } from "querystring";

import { fetchMember, fetchPoketwoMember } from "./db";
import { Member, Position, User } from "./types";

const IRON_CONFIG = {
  password: process.env.SECRET_KEY as string,
  cookieName: "forms.poketwo.net",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 2419200,
  },
};

type SessionVars = {
  user?: User;
  member?: Member;
  error?: string;
  next?: string;
  id?: string;
  token?: TokenRequestResult;
};

export type NextIronRequest = NextApiRequest & { session: IronSession<SessionVars> };

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
  CONTINUE,
}

const addMemberInfo = async (session: IronSession<SessionVars>) => {
  const user = session.user;

  const member = user ? await fetchMember(user.id) : undefined;
  session.member = member;

  const poketwoMember = user ? await fetchPoketwoMember(user.id) : undefined;
  session.poketwoMember = poketwoMember;

  return { user, member, poketwoMember };
};

const handleRequest = async (user: User | undefined, mode: AuthMode) => {
  if (mode === AuthMode.GUEST && user) return SessionStatus.REDIRECT_DASHBOARD;
  if (mode === AuthMode.AUTHENTICATED && !user) return SessionStatus.REDIRECT_LOGIN;
  return SessionStatus.CONTINUE;
};

export const withSession = (
  handler: (req: NextIronRequest, res: NextApiResponse) => void,
  mode: AuthMode
) => {
  const wrapped = async (req: NextIronRequest, res: NextApiResponse) => {
    req.session = await getIronSession<SessionVars>(req, res, IRON_CONFIG);
    const { user } = await addMemberInfo(req.session);
    const status = await handleRequest(user, mode);

    if (status === SessionStatus.REDIRECT_DASHBOARD) {
      return res.redirect("/dashboard");
    } else if (status === SessionStatus.REDIRECT_LOGIN) {
      return res.redirect("/");
    }

    return handler(req, res);
  };

  return wrapped;
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
    ctx.req.session = await getIronSession<SessionVars>(ctx.req, ctx.res, IRON_CONFIG);
    const { user } = await addMemberInfo(ctx.req.session);
    const status = await handleRequest(user, mode);

    if (status === SessionStatus.REDIRECT_DASHBOARD) {
      return { redirect: { permanent: false, destination: "/dashboard" } };
    } else if (status === SessionStatus.REDIRECT_LOGIN) {
      return { redirect: { permanent: false, destination: "/" } };
    }

    return handler(ctx);
  };

  return wrapped;
};
