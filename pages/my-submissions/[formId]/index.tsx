import { Heading, Stack, Text } from "@chakra-ui/layout";
import { Form } from "@formium/types";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchUserFormSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SerializableSubmission, User, makeSerializable } from "~helpers/types";

type UserSubmissionsPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
};

const UserSubmissionsPage = ({ user, form, submissions }: UserSubmissionsPageProps) => {
  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submissions={submissions}
      baseHref={`/my-submissions/${form.slug}`}
      userMode
    >
      <Stack spacing="4" alignItems="center">
        <Heading size="lg">
          {submissions.length} Submission{submissions.length === 1 ? "" : "s"}
        </Heading>
        <Text>Select a submission from the sidebar to view details.</Text>
      </Stack>
    </SubmissionsLayout>
  );
};

export default UserSubmissionsPage;

type UserSubmissionsPageQuery = {
  formId: string;
};

export const getServerSideProps = withServerSideSession<UserSubmissionsPageProps, UserSubmissionsPageQuery>(
  async ({ req, params, query }) => {
    if (!params) throw new Error("No params found.");
    const { formId } = params;

    const user = req.session.user;
    if (!user) throw new Error("User not found");

    let form;
    try {
      form = await formium.getFormBySlug(formId);
    } catch (e) {
      const err = e as any;
      if (err.status === 404) return { notFound: true };
    }

    if (!form) return { notFound: true };

    const _submissions = await fetchUserFormSubmissions(form.slug, user.id, {
      page: Number(query.page ?? 1),
    });
    const submissions = await _submissions.toArray();

    return {
      props: {
        form,
        user,
        submissions: submissions.map(makeSerializable).map((s) => ({
          ...s,
          reviewer_id: null,
          email: null,
        })),
      },
    };
  },
  AuthMode.AUTHENTICATED,
);
