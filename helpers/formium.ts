import { createClient } from "@formium/client";
import { localForm, localReviewFixture } from "./localReviewFixture";

export const formium = createClient(process.env.NEXT_PUBLIC_FORMIUM_PROJECT_ID as string, {
  apiToken: process.env.FORMIUM_TOKEN,
});
if (localReviewFixture) {
  formium.getFormBySlug = (async (slug: string) => {
    if (slug !== localForm.slug) throw { status: 404 };
    return localForm;
  }) as typeof formium.getFormBySlug;
}

export type APIError = Error & {
  status: number;
  serverMessage: string;
  link?: string;
  action?: string;
  retryAfter: number | null | "never";
  [key: string]: any;
};
