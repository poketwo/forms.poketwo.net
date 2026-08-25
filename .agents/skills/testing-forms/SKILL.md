---
name: testing-forms
description: Set up and runtime-test forms.poketwo.net flows with Discord OAuth, MongoDB, Formium fixtures, and submission detail views.
---

# Testing forms.poketwo.net

## Overview
This is a Next.js 14 app using Chakra UI, MongoDB, Discord OAuth, Formium, and SendGrid. It handles form submissions such as staff applications and appeals for the Pokétwo Discord community.

## Devin Secrets Needed
For real integrated data, provision:
- `FORMS_DATABASE_URI`
- `FORMS_DATABASE_NAME`
- `FORMS_POKETWO_DATABASE_URI`
- `FORMS_POKETWO_DATABASE_NAME`
- `FORMS_SECRET_KEY`
- `FORMS_DISCORD_CLIENT_ID`
- `FORMS_DISCORD_CLIENT_SECRET`
- `FORMS_FORMIUM_PROJECT_ID`
- `FORMS_FORMIUM_TOKEN`
- `FORMS_SENDGRID_KEY`

If repository-specific aliases are unavailable, organization secrets named `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` can support localhost OAuth when they belong to a Discord application permitting `http://localhost:3000/api/callback`. Never copy production session cookies.

## Local development
```bash
sudo systemctl start mongod
npm install
npm run dev
```

The app uses two Mongo connections configured by:
- `DATABASE_URI` / `DATABASE_NAME` for member and submission data.
- `POKETWO_DATABASE_URI` / `POKETWO_DATABASE_NAME` for Pokétwo member state.

Mongo member identifiers and role arrays are BSON `Long` values. The Guiduck member key is shaped like `{ _id: { id: Long, guild_id: Long }, roles: Long[] }`; the Pokétwo member key is `_id: Long`.

## Testing without Formium credentials
Use a temporary, clearly test-gated Formium fixture only when real Formium access is unavailable. Keep submission APIs, MongoDB, authorization, and real list/detail routes intact so the run remains end-to-end for application-owned behavior. Suppress outbound SendGrid only under the same test-only flag, then revert all fixture edits after testing.

A minimal Formium schema needs `schema.pageIds`, a page field whose `items` point to input field IDs, and matching entries in `schema.fields`. Important: installed `@formium/types` runtime `FormElementType` values are strings (for example, `"PAGE"` and `"LONG_TEXT"`) even though declarations may look like numeric enums. Use imported enum members or the string runtime values; numeric literals cause Formium validation to fail at render time.

Real OAuth may require Discord CAPTCHA and new-location email verification. Complete those in the UI before recording feature tests. Restarting the local Next.js server with the same `SECRET_KEY` preserves the authenticated browser session.

## Key routes
- `/a/[formId]` — authenticated user form
- `/my-submissions/[formId]` — submitter list
- `/my-submissions/[formId]/[submissionId]` — submitter detail
- `/a/[formId]/submissions` — reviewer list
- `/a/[formId]/submissions/[submissionId]` — reviewer detail/actions
- `/api/forms/[formId]/submissions` — submission POST

## Runtime evidence strategy
- Prefer UI submission and navigation over direct requests with authenticated browser cookies.
- When client validation prevents exercising a server-only rejection path, use a temporary environment-gated same-origin UI probe that visibly reports the unchanged API handler's exact status and body. Label it as test-only, never extract cookies, and revert it after the run.
- Use local MongoDB readback after UI submission to corroborate exact normalization/omission when needed.
- Seed only local databases for role- or state-gated flows, restart the app to clear member caches, and remove or isolate test databases afterward.
- For image preview tests, pair visible screenshots/recording with DOM source inspection when proving URL translation or extension retention.
- For native-video preview tests, preflight a small direct `video/mp4` URL in the installed browser, then pair it with deterministic HTTP 404 and non-video content-type URLs to distinguish playback from both fallback modes.

## Static checks
```bash
npm run lint
npx tsc --noEmit --incremental false
```
