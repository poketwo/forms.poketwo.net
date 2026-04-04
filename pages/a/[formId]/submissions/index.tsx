import { Heading, Stack, Text } from "@chakra-ui/layout";
import { Form } from "@formium/types";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmissions, fetchUserFormSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { permittedToViewForm } from "~helpers/permissions";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SerializableSubmission, User, makeSerializable } from "~helpers/types";

type SubmissionsPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
  isAdmin: boolean;
};

const SubmissionsPage = ({ user, form, submissions, isAdmin }: SubmissionsPageProps) => {
  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submissions={submissions}
      userMode={!isAdmin}
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

export default SubmissionsPage;

type SubmissionsPageQuery = {
  formId: string;
};

export const getServerSideProps = withServerSideSession<SubmissionsPageProps, SubmissionsPageQuery>(
  async ({ req, params, query }) => {
    if (!params) throw new Error("No params found.");
    const { formId } = params;

    const user = req.session.user;
    const member = req.session.member;
    if (!user) throw new Error("User not found");

    let form;
    try {
      form = await formium.getFormBySlug(formId);
    } catch (e) {
      const err = e as any;
      if (err.status === 404) return { notFound: true };
    }

    if (!form) return { notFound: true };

    const isAdmin = member ? permittedToViewForm(member, formId) : false;

    if (isAdmin) {
      // Admin view: show all submissions with filters
      const _submissions = await fetchSubmissions(form.slug, {
        page: Number(query.page ?? 1),
        userId: query.userId?.toString(),
        status: query.status ? Number(query.status) : { $nin: [1, 2] },
      });
      const submissions = await _submissions.toArray();

      return {
        props: {
          form,
          user,
          submissions: submissions.map(makeSerializable),
          isAdmin: true,
        },
      };
    } else {
      // User view: show only their own submissions
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
          isAdmin: false,
        },
      };
    }
  },
  AuthMode.AUTHENTICATED,
);
