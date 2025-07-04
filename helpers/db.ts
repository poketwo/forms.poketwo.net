import { ObjectId } from "bson";
import { getUnixTime, sub } from "date-fns";
import { Long, MongoClient, UpdateFilter } from "mongodb";
import NodeCache from "node-cache";

import {
  Member,
  RawMember,
  PoketwoMember,
  RawPoketwoMember,
  Submission,
  SubmissionStatus,
} from "./types";

// Guiduck DB

let client: MongoClient | undefined;

const connect = async () => {
  if (!client) client = new MongoClient(process.env.DATABASE_URI as string);
  try {
    await client.connect();
    return client.db(process.env.DATABASE_NAME);
  } catch (err) {
    throw err;
  }
};

const dbPromise = connect();
const cache = new NodeCache({ stdTTL: 60 });

const wrapCache = <T extends (id: string) => Promise<any>>(key: string, func: T) => {
  return async (id: string): Promise<ReturnType<T>> => {
    const cached = cache.get<ReturnType<T>>(`${key}:${id}`);
    if (cached) return cached;
    const val = await func(id);
    cache.set(`${key}:${id}`, val);
    return val;
  };
};

export const fetchMember = wrapCache("member", async (id: string): Promise<Member | undefined> => {
  const db = await dbPromise;
  const collection = db.collection("member");
  const result = <RawMember | null>await collection.findOne({
    _id: { id: Long.fromString(id), guild_id: Long.fromString("716390832034414685") },
  });
  if (!result) return undefined;

  const roles = result.roles?.map((x) => x.toString());

  return {
    ...result,
    _id: result._id.toString(),
    roles,
  };
});

// Poketwo DB

let poketwoClient: MongoClient | undefined;

const connectPoketwo = async () => {
  if (!poketwoClient) poketwoClient = new MongoClient(process.env.POKETWO_DATABASE_URI as string);
  try {
    await poketwoClient.connect();
    return poketwoClient.db(process.env.POKETWO_DATABASE_NAME);
  } catch (err) {
    throw err;
  }
};

const poketwoDbPromise = connectPoketwo();
const poketwoCache = new NodeCache({ stdTTL: 60 });

const wrapPoketwoCache = <T extends (id: string) => Promise<any>>(key: string, func: T) => {
  return async (id: string): Promise<ReturnType<T>> => {
    const cached = poketwoCache.get<ReturnType<T>>(`${key}:${id}`);
    if (cached) return cached;
    const val = await func(id);
    poketwoCache.set(`${key}:${id}`, val);
    return val;
  };
};

export const fetchPoketwoMember = wrapPoketwoCache(
  "member",
  async (id: string): Promise<PoketwoMember | undefined> => {
    const db = await poketwoDbPromise;
    const collection = db.collection("member");
    const result = <RawPoketwoMember | null>await collection.findOne({
      _id: Long.fromString(id),
    });
    if (!result) return undefined;

    return {
      ...result,
      _id: result._id.toString(),
    };
  },
);

export const fetchGuild = async (id: string) => {
  const db = await dbPromise;
  const collection = db.collection("guild");
  return collection.findOne({ _id: Long.fromString(id) });
};

export const fetchChannel = async (id: string) => {
  const db = await dbPromise;
  const collection = db.collection("channel");
  return collection.findOne({ _id: Long.fromString(id) });
};

export const fetchMessage = async (id: string) => {
  const db = await dbPromise;
  const collection = db.collection("message");
  return collection.findOne({ _id: Long.fromString(id) });
};

export const fetchSubmission = async <T = any>(id: string) => {
  const db = await dbPromise;
  const collection = db.collection("submission");
  return collection.findOne<Submission<T>>({ _id: ObjectId.createFromHexString(id) });
};

export const updateSubmission = async <T = any>(
  id: string,
  update: UpdateFilter<Omit<Submission<T>, "_id">>
) => {
  const db = await dbPromise;
  const collection = db.collection("submission");
  return collection.updateOne({ _id: ObjectId.createFromHexString(id) }, update);
};

type FetchSubmissionsOptions = {
  userId?: string;
  page?: number;
  onlyRecent?: boolean;
  status?: SubmissionStatus | object;
};

export const fetchSubmissions = async <T = any>(
  formId: string,
  options?: FetchSubmissionsOptions
) => {
  const db = await dbPromise;
  const collection = db.collection("submission");
  let query: any = { form_id: formId };

  if (options?.status) {
    query = {
      ...query,
      status: options.status,
    };
  }

  if (options?.status === 0) {
    query = {
      ...query,
      status: { $exists: false },
    };
  }

  if (options?.userId) {
    query = {
      ...query,
      user_id: Long.fromString(options.userId),
    };
  }

  if (options?.onlyRecent) {
    query = {
      ...query,
      _id: { $gt: ObjectId.createFromTime(getUnixTime(sub(new Date(), { months: 6 }))) },
    };
  }

  let cursor = collection.find<Submission<T>>(query).sort({ status: -1, _id: -1 });

  if (options?.page) {
    cursor = cursor.limit(100).skip(100 * (options.page - 1));
  }

  return cursor;
};

export const createSubmission = async <T = any>(submission: Omit<Submission<T>, "_id">) => {
  const db = await dbPromise;
  const collection = db.collection("submission");
  return collection.insertOne(submission);
};
