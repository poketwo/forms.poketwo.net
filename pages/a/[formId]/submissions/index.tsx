import { Heading, Stack, Text } from "@chakra-ui/layout";
import { Form } from "@formium/types";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { permittedToViewForm } from "~helpers/permissions";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { Position, SerializableSubmission, User, makeSerializable } from "~helpers/types";

type SubmissionsPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
};

const SubmissionsPage = ({ user, form, submissions }: SubmissionsPageProps) => {
  return (
    <SubmissionsLayout user={user} form={form} submissions={submissions}>
      <Stack spacing="4" alignItems="center">
        <Heading size="lg">
          {submissions.length} Submission{submissions.length === 1 ? "" : "s"}
        </Heading>
        <Text>use the sidebar to view wow</Text>
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
    if (!user || !member) throw new Error("User not found");

    if (!permittedToViewForm(member, formId)) {
      return { redirect: { permanent: false, destination: "/dashboard" } };
    }

    let form;
    try {
      form = await formium.getFormBySlug(formId);
    } catch (e) {
      const err = e as any;
      if (err.status === 404) return { notFound: true };
    }

    if (!form) return { notFound: true };

    const _submissions = await fetchSubmissions(form.slug, {
      page: Number(query.page ?? 1),
      userId: query.userId?.toString(),
      status: query.status ? Number(query.status) : { $nin: [1, 2] },
    });
    const submissions = await _submissions.toArray();

    return {
      props: {
        id: formId,
        form,
        user,
        submissions: submissions.map(makeSerializable),
      },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.COMMUNITY_MANAGER
);
