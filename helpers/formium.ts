import { createClient } from "@formium/client";

export const formium = createClient(process.env.NEXT_PUBLIC_FORMIUM_PROJECT_ID, {
  apiToken: process.env.FORMIUM_TOKEN,
});
