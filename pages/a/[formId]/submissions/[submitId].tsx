import { Button } from "@chakra-ui/button";
import { Box, Code, Divider, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import { Results } from "@formium/client";
import { Form, Submit } from "@formium/types";
import { HiCheck, HiX } from "react-icons/hi";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { Position, User } from "~helpers/types";

type SubmissionHeaderProps = {
  submit: Submit;
};

const SubmissionHeader = ({ submit }: SubmissionHeaderProps) => {
  const [name, discrim] = submit.data.discordTag?.split("#", 2);
  return (
    <HStack>
      <Heading size="md" flex="1">
        {name}
        <chakra.span color="gray.500" fontWeight="medium">
          #{discrim}
        </chakra.span>
      </Heading>
      <Button colorScheme="green" size="sm" leftIcon={<HiCheck />}>
        Accept
      </Button>
      <Button colorScheme="red" size="sm" leftIcon={<HiX />}>
        Reject
      </Button>
    </HStack>
  );
};

type SubmissionContentProps = {
  form: Form;
  submit: Submit;
};

const SubmissionContent = ({ form, submit }: SubmissionContentProps) => {
  const fieldNames = Object.values(form.schema?.fields ?? {}).reduce(
    (acc, val) => acc.set(val.slug, val.title),
    new Map<string, string | undefined>()
  );

  const ownedFields = [...fieldNames.keys()].filter((x) => submit.data.hasOwnProperty(x));
  const otherFields = Object.keys(submit.data).filter((x) => !ownedFields.includes(x));

  return (
    <Stack spacing="4">
      {ownedFields.map((x) => (
        <Stack key={x} borderWidth={1} rounded="md" p="4" alignItems="flex-start">
          <HStack>
            <Text fontWeight="bold">{fieldNames.get(x)}</Text>
            <Text fontSize="sm" color="gray.500">
              {x}
            </Text>
          </HStack>

          <Text>{submit.data[x]}</Text>
        </Stack>
      ))}

      {otherFields.length > 0 && <Divider />}

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
  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submits={submits}
      primaryKey="discordTag"
      secondaryKey="email"
      contentContainerProps={{ p: 0 }}
    >
      <Flex direction="column" h="full" overflow="hidden">
        <Box px="6" py="3" borderBottomWidth={1}>
          <SubmissionHeader submit={submit} />
        </Box>
        <Box flex="1" overflow="scroll" p="6">
          <SubmissionContent key={form.id} form={form} submit={submit} />
        </Box>
      </Flex>
    </SubmissionsLayout>
  );
};

export default SubmissionPage;

type SubmissionPageQuery = {
  formId: string;
  submitId: string;
};

export const getServerSideProps = withServerSideSession<SubmissionPageProps, SubmissionPageQuery>(
  async ({ req, params }) => {
    const user = req.session.get<User>("user");
    if (!params) throw new Error("No params found.");
    if (!user) throw new Error("User not found");

    const { formId, submitId } = params;

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
