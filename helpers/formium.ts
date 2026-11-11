import { createClient } from "@formium/client";

export const formium = createClient(process.env.NEXT_PUBLIC_FORMIUM_PROJECT_ID as string, {
  apiToken: process.env.FORMIUM_TOKEN,
});

export type APIError = Error & {
  status: number;
  serverMessage: string;
  link?: string;
  action?: string;
  retryAfter: number | null | "never";
  [key: string]: any;
};
