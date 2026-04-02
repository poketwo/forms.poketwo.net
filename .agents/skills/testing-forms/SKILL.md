# Testing forms.poketwo.net

## Overview
This is a Next.js app (v14) using Chakra UI, MongoDB, Discord OAuth, Formium, and SendGrid. It handles form submissions (e.g., staff applications, suspension appeals) for the Poketwo Discord community.

## Required Environment Variables
The app requires these env vars to run:
- `DATABASE_URI` — MongoDB connection string for Guiduck DB
- `DATABASE_NAME` — Guiduck database name
- `POKETWO_DATABASE_URI` — MongoDB connection string for Poketwo DB
- `POKETWO_DATABASE_NAME` — Poketwo database name
- `SENDGRID_KEY` — SendGrid API key for email notifications
- `SECRET_KEY` — Session encryption key (iron-session)
- `DISCORD_CLIENT_ID` — Discord OAuth app client ID
- `DISCORD_CLIENT_SECRET` — Discord OAuth app client secret
- `NEXT_PUBLIC_FORMIUM_PROJECT_ID` — Formium project ID
- `FORMIUM_TOKEN` — Formium API token

## Devin Secrets Needed
None currently configured. To test with real data, the following secrets would need to be provisioned:
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

## Local Development
```bash
npm install
npm run dev
```

## Testing Without Production Credentials
Since DB connections happen at module level, the dev server won't fully function without real credentials. However, you can:

1. **Build verification**: Run with dummy env vars to verify the build succeeds:
   ```bash
   DATABASE_URI="mongodb://localhost:27017" DATABASE_NAME="test" \
   POKETWO_DATABASE_URI="mongodb://localhost:27017" POKETWO_DATABASE_NAME="test" \
   SENDGRID_KEY="SG.test" SECRET_KEY="testsecretkeytestsecretkey" \
   DISCORD_CLIENT_ID="test" DISCORD_CLIENT_SECRET="test" \
   NEXT_PUBLIC_FORMIUM_PROJECT_ID="test" FORMIUM_TOKEN="test" \
   npx next build
   ```

2. **Component rendering tests**: Create temporary test pages in `pages/` that render components with mock data (bypassing `getServerSideProps`). This works because client-side components are pure React and don't need DB access.

3. **Static analysis**: `npx tsc --noEmit` and `npx next lint` work without env vars.

## Key Pages & Routes
- `/a/[formId]` — Form submission page (user-facing)
- `/a/[formId]/submissions` — Submission list (admin, requires COMMUNITY_MANAGER+)
- `/a/[formId]/submissions/[submissionId]` — Submission detail with review actions (admin)
- `/dashboard` — Dashboard page
- `/api/forms/[formId]/submissions` — POST to create submission
- `/api/forms/[formId]/submissions/[submissionId]` — PATCH to update status/comment

## Architecture Notes
- Auth: Discord OAuth with iron-session
- DB: MongoDB via native driver (not Mongoose)
- Forms: Formium for form definitions, custom MongoDB for submissions
- The `submission` collection stores: form_id, user_id, user_tag, email, data, status, reviewer_id, comment
- `SubmissionStatus` enum: UNDER_REVIEW(0), REJECTED(1), ACCEPTED(2), MARKED_BLUE(3), MARKED_ORANGE(4), MARKED_YELLOW(5), MARKED_PURPLE(6)

## CI/CD
- Vercel deployment (may fail on preview deploys if env vars aren't configured)
- Vercel deploy check is NOT marked as required
- ESLint via `next lint`
- No pre-commit hooks configured
