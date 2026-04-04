import { fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SubmissionStatus } from "~helpers/types";

// This page redirects to either the latest in-flight submission or the new form page.
// /a/[formId] -> /a/[formId]/submissions/[latestSubmissionId] (if in-flight)
// /a/[formId] -> /a/[formId]/new (otherwise)

const FormRedirectPage = () => null;
export default FormRedirectPage;

export const getServerSideProps = withServerSideSession(async ({ req, params }) => {
  const id = params?.formId?.toString();
  const user = req.session.user;

  if (!id) throw new Error("Form ID not found");
  if (!user) throw new Error("User not found");

  let form;
  try {
    form = await formium.getFormBySlug(id);
  } catch (e) {
    const err = e as any;
    if (err.status === 404) return { notFound: true };
  }

  if (!form) return { notFound: true };

  // Check for recent submissions (within cooldown period)
  const _submissions = await fetchSubmissions(form.slug, { userId: user.id, onlyRecent: true });
  const submissions = await _submissions.limit(1).toArray();

  if (submissions.length > 0) {
    const latestStatus = submissions[0].status ?? SubmissionStatus.UNDER_REVIEW;
    // If the latest submission is not yet resolved (under review or marked), redirect to it
    if (
      latestStatus !== SubmissionStatus.ACCEPTED &&
      latestStatus !== SubmissionStatus.REJECTED
    ) {
      return {
        redirect: {
          permanent: false,
          destination: `/a/${id}/submissions/${submissions[0]._id.toString()}`,
        },
      };
    }
    // If accepted or rejected but still within cooldown, redirect to the new page
    // (which will show the status alert with cooldown timer)
    return {
      redirect: {
        permanent: false,
        destination: `/a/${id}/new`,
      },
    };
  }

  // No recent submissions, go to new form
  return {
    redirect: {
      permanent: false,
      destination: `/a/${id}/new`,
    },
  };
}, AuthMode.AUTHENTICATED);
