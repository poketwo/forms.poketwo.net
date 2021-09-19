import { Code, Divider, HStack, Stack, Text } from "@chakra-ui/layout";
import { Results } from "@formium/client";
import { Form, Submit } from "@formium/types";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { Position, User } from "~helpers/types";

type SubmissionProps = {
  form: Form;
  submit: Submit;
};

const Submission = ({ form, submit }: SubmissionProps) => {
  console.log(form);
  const fieldNames = Object.values(form.schema?.fields ?? {}).reduce(
    (acc, val) => acc.set(val.slug, val.title),
    new Map<string, string | undefined>()
  );

  const ownedFields = [...fieldNames.keys()].filter((x) => submit.data.hasOwnProperty(x));
  const otherFields = Object.keys(submit.data).filter((x) => !ownedFields.includes(x));

  console.log(ownedFields, otherFields);

  return (
    <Stack spacing="8">
      {ownedFields.map((x) => (
        <Stack key={x} alignItems="flex-start">
          <HStack>
            <Text fontWeight="bold">{fieldNames.get(x)}</Text>
            <Text fontSize="sm" color="gray.500">
              {x}
            </Text>
          </HStack>

          <Text>{submit.data[x]}</Text>
        </Stack>
      ))}

      <Divider />

      {otherFields.map((x) => (
        <Stack key={x} alignItems="flex-start">
          <Code fontWeight="bold">{x}</Code>
          <Text>{submit.data[x]}</Text>
        </Stack>
      ))}
    </Stack>
  );
};

type SubmissionPageProps = {
  user: User;
  form: Form;
  submits: Submit[];
  submit: Submit;
};

const SubmissionPage = ({ user, form, submits, submit }: SubmissionPageProps) => {
  console.log(submit);
  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submits={submits}
      primaryKey="discordTag"
      secondaryKey="email"
    >
      <Submission form={form} submit={submit} />
    </SubmissionsLayout>
  );
};

export default SubmissionPage;

export const getServerSideProps = withServerSideSession<SubmissionPageProps>(
  async ({ req, params }) => {
    const formId = params?.formId?.toString();
    const submitId = params?.submitId?.toString();
    const user = req.session.get<User>("user");

    if (!formId) throw new Error("Form ID not found");
    if (!submitId) throw new Error("Form ID not found");
    if (!user) throw new Error("User not found");

    console.log(formId);

    let form;
    try {
      form = await formium.getFormBySlug(formId);
    } catch (e) {
      const err = e as any;
      if (err.status === 404) return { notFound: true };
    }

    if (!form) return { notFound: true };

    const submits: Results<Submit> = (await formium.findSubmits({
      formId: form.id,
      sort: "-createAt",
    })) as any;

    const submit = await formium.getSubmit(submitId);

    return {
      props: { id: formId, form, user, submits: submits.data, submit },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.ADMIN
);
