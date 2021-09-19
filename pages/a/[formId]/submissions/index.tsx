import { Heading, Stack, Text } from "@chakra-ui/layout";
import { Results } from "@formium/client";
import { Form, Submit } from "@formium/types";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { Position, User } from "~helpers/types";

type SubmissionsPageProps = {
  user: User;
  form: Form;
  submits: Submit[];
};

const SubmissionsPage = ({ user, form, submits }: SubmissionsPageProps) => {
  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submits={submits}
      primaryKey="discordTag"
      secondaryKey="email"
    >
      <Stack spacing="4" alignItems="center">
        <Heading size="lg">
          {submits.length} Submission{submits.length === 1 ? "" : "s"}
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

    const submits: Results<Submit> = (await formium.findSubmits({
      formId: form.id,
      sort: "-createAt",
    })) as any;

    return {
      props: { id, form, user, submits: submits.data },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.ADMIN
);
