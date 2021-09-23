import { Heading, Stack, Text } from "@chakra-ui/layout";
import { Form } from "@formium/types";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { makeSerializable, Position, SerializableSubmission, User } from "~helpers/types";

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

export const getServerSideProps = withServerSideSession<SubmissionsPageProps>(
  async ({ req, params }) => {
    const id = params?.formId?.toString();
    const user = req.session.get<User>("user");

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

    const _submissions = await fetchSubmissions(form.slug);
    const submissions = await _submissions.toArray();

    return {
      props: {
        id,
        form,
        user,
        submissions: submissions.map(makeSerializable),
      },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.ADMIN
);
