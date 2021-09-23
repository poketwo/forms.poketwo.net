import { Button } from "@chakra-ui/button";
import { Box, Code, Divider, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import { Form } from "@formium/types";
import { HiCheck, HiX } from "react-icons/hi";

import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmission, fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { makeSerializable, Position, SerializableSubmission, User } from "~helpers/types";

type SubmissionHeaderProps = {
  submission: SerializableSubmission;
};

const SubmissionHeader = ({ submission }: SubmissionHeaderProps) => {
  const [name, discrim] = submission.user_tag.split("#", 2);
  return (
    <HStack>
      <Heading size="md">
        {name}
        <chakra.span color="gray.500" fontWeight="medium">
          #{discrim}
        </chakra.span>
      </Heading>
      <Text flex="1" fontSize="sm" color="gray.500">
        {submission.user_id}
      </Text>

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
  submission: SerializableSubmission;
};

const SubmissionContent = ({ form, submission }: SubmissionContentProps) => {
  const fieldNames = Object.values(form.schema?.fields ?? {}).reduce(
    (acc, val) => acc.set(val.slug, val.title),
    new Map<string, string | undefined>()
  );

  const ownedFields = [...fieldNames.keys()].filter((x) => submission.data.hasOwnProperty(x));
  const otherFields = Object.keys(submission.data).filter((x) => !ownedFields.includes(x));

  return (
    <Stack spacing="4">
      {ownedFields.map((x) => (
        <Stack key={x} borderWidth={1} rounded="md" p="4" alignItems="flex-start">
          <Text
            fontWeight="bold"
            _after={{
              content: `"${x}"`,
              ml: 2,
              color: "gray.500",
              fontWeight: "normal",
              fontSize: "sm",
            }}
          >
            {fieldNames.get(x)}
          </Text>

          <Text>{submission.data[x]}</Text>
        </Stack>
      ))}

      {otherFields.length > 0 && <Divider />}

      {otherFields.map((x) => (
        <Stack key={x} alignItems="flex-start">
          <Code fontWeight="bold">{x}</Code>
          <Text>{submission.data[x]}</Text>
        </Stack>
      ))}
    </Stack>
  );
};

type SubmissionPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
  submission: SerializableSubmission;
};

const SubmissionPage = ({ user, form, submissions, submission }: SubmissionPageProps) => {
  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submissions={submissions}
      contentContainerProps={{ p: 0 }}
    >
      <Flex direction="column" h="full" overflow="hidden">
        <Box px="6" py="3" borderBottomWidth={1}>
          <SubmissionHeader submission={submission} />
        </Box>
        <Box flex="1" overflow="scroll" p="6">
          <SubmissionContent key={form.id} form={form} submission={submission} />
        </Box>
      </Flex>
    </SubmissionsLayout>
  );
};

export default SubmissionPage;

type SubmissionPageQuery = {
  formId: string;
  submissionId: string;
};

export const getServerSideProps = withServerSideSession<SubmissionPageProps, SubmissionPageQuery>(
  async ({ req, params }) => {
    const user = req.session.get<User>("user");
    if (!params) throw new Error("No params found.");
    if (!user) throw new Error("User not found");

    const { formId, submissionId } = params;

    let form;
    try {
      form = await formium.getFormBySlug(formId);
    } catch (e) {
      const err = e as any;
      if (err.status === 404) return { notFound: true };
    }

    if (!form) return { notFound: true };

    const _submissions = await fetchSubmissions(form.slug);
    const submissions = await _submissions.toArray();
    const submission = await fetchSubmission(submissionId);

    if (!submission) return { notFound: true };

    return {
      props: {
        id: formId,
        form,
        user,
        submissions: submissions.map(makeSerializable),
        submission: makeSerializable(submission),
      },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.ADMIN
);
