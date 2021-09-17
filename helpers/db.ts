import { Long, MongoClient } from "mongodb";
import NodeCache from "node-cache";

import { Member, Position, RawMember } from "./types";

const client = new MongoClient(process.env.DATABASE_URI as string);

const connect = async () => {
  try {
    await client.connect();
    return client.db(process.env.DATABASE_NAME);
  } catch (err) {
    throw err;
  }
};

const dbPromise = connect();
const cache = new NodeCache({ stdTTL: 60 });

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

const wrapCache = <T extends (id: string) => Promise<any>>(key: string, func: T) => {
  return async (id: string): Promise<Awaited<ReturnType<T>>> => {
    const cached = cache.get<ReturnType<T>>(`${key}:${id}`);
    if (cached) return cached;
    const val = await func(id);
    cache.set(`${key}:${id}`, val);
    return val;
  };
};

const ROLES: [Position, string[]][] = [
  [Position.ADMIN, ["718006431231508481"]],
  [Position.MODERATOR, ["724879492622843944", "813433839471820810"]],
  [Position.HELPER, ["732712709514199110", "794438698241884200"]],
];

export const fetchMember = wrapCache("member", async (id: string): Promise<Member | undefined> => {
  const db = await dbPromise;
  const collection = db.collection("member");
  const result = <RawMember | null>await collection.findOne({ _id: Long.fromString(id) });
  if (!result) return undefined;

  const roles = result.roles?.map((x) => x.toString());

  return {
    ...result,
    _id: result._id.toString(),
    roles,
    position: ROLES.find(([, ids]) => roles?.some((x) => ids.includes(x)))?.[0] ?? Position.MEMBER,
  };
});

export const fetchGuild = async (id: string) => {
  const db = await dbPromise;
  const collection = db.collection("guild");
  return await collection.findOne({ _id: Long.fromString(id) });
};

export const fetchChannel = async (id: string) => {
  const db = await dbPromise;
  const collection = db.collection("channel");
  return await collection.findOne({ _id: Long.fromString(id) });
};

export const fetchMessage = async (id: string) => {
  const db = await dbPromise;
  const collection = db.collection("message");
  return await collection.findOne({ _id: Long.fromString(id) });
};
