import {
  Box,
  Button,
  ButtonProps,
  chakra,
  Code,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  LightMode,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form } from "@formium/types";
import { ReactElement, useEffect, useState } from "react";
import { HiCheck, HiFlag, HiX } from "react-icons/hi";

import ErrorAlert from "~components/formium/ErrorAlert";
import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmission, fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import {
  makeSerializable,
  Position,
  SerializableSubmission,
  SubmissionStatus,
  User,
} from "~helpers/types";
import { delay } from "~helpers/utils";

type HeaderButtonProps = ButtonProps & {
  icon: ReactElement;
  label: string;
  onClick: () => void;
};

const HeaderButton = ({ icon, label, onClick, ...props }: HeaderButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const handleClick = async () => {
    try {
      setLoading(true);
      await delay(300);
      await onClick();
    } catch (e) {
      setError(e as Error);
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        display={{ base: "none", lg: "flex" }}
        size="sm"
        leftIcon={icon}
        onClick={handleClick}
        isLoading={loading}
        {...props}
      >
        {label}
      </Button>
      <IconButton
        display={{ base: "flex", lg: "none" }}
        aria-label={label}
        size="lg"
        icon={icon}
        onClick={handleClick}
        isLoading={loading}
        {...props}
      />
      <ErrorAlert error={error} setError={setError} />
    </>
  );
};

type SubmissionHeaderProps = {
  submission: SerializableSubmission;
  onSetStatus: (status: SubmissionStatus) => void;
};

const SubmissionHeader = ({ submission, onSetStatus }: SubmissionHeaderProps) => {
  const [name, discrim] = submission.user_tag.split("#", 2);

  return (
    <HStack spacing={2}>
      <Stack
        flex="1"
        spacing={{ base: 0, lg: 2 }}
        direction={{ base: "column", lg: "row" }}
        alignItems={{ base: "flex-start", lg: "center" }}
      >
        <Heading size="md">
          {name}
          <chakra.span color="gray.500" fontWeight="medium">
            #{discrim}
          </chakra.span>
        </Heading>

        <Text flex="1" fontSize="sm" color="gray.500">
          {submission.user_id}
        </Text>
      </Stack>

      <LightMode>
        <HeaderButton
          colorScheme="green"
          isDisabled={submission.status === SubmissionStatus.ACCEPTED}
          icon={<HiCheck />}
          label="Accept"
          onClick={() => onSetStatus(SubmissionStatus.ACCEPTED)}
        />
        <HeaderButton
          colorScheme="blue"
          isDisabled={submission.status === SubmissionStatus.MARKED}
          icon={<HiFlag />}
          label="Mark for Review"
          onClick={() => onSetStatus(SubmissionStatus.MARKED)}
        />
        <HeaderButton
          colorScheme="red"
          isDisabled={submission.status === SubmissionStatus.REJECTED}
          icon={<HiX />}
          label="Reject"
          onClick={() => onSetStatus(SubmissionStatus.REJECTED)}
        />
      </LightMode>
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
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  return (
    <Stack spacing="4">
      {ownedFields.map((x) => (
        <Stack key={x} shadow={shadow} bg={bg} rounded="md" p="4" alignItems="flex-start">
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
  const [subs, setSubs] = useState(submissions);
  const [sub, setSub] = useState(submission);
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  useEffect(() => setSubs(submissions), [submissions]);
  useEffect(() => setSub(submission), [submission]);

  const handleSetStatus = async (status: SubmissionStatus) => {
    const resp = await fetch(`/api/forms/${form.slug}/submissions/${submission._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!resp.ok) throw new Error(await resp.text());

    const listSub = submissions.find((x) => x._id === sub._id);
    if (listSub) listSub.status = status;
    setSub({ ...sub, status });
    setSubs(submissions);
  };

  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submissions={subs}
      submission={submission}
      contentContainerProps={{ p: 0 }}
    >
      <Flex direction="column" h="full" overflow="hidden">
        <Box px="6" py="4" shadow={shadow} bg={bg} zIndex={1}>
          <SubmissionHeader submission={sub} onSetStatus={handleSetStatus} />
        </Box>
        <Box flex="1" overflow="scroll" p="6" zIndex={0}>
          <SubmissionContent key={form.id} form={form} submission={sub} />
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
  async ({ req, params, query }) => {
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

    const _submissions = await fetchSubmissions(form.slug, {
      page: Number(query.page ?? 1),
      userId: query.userId?.toString(),
    });
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
  Position.COMMUNITY_MANAGER
);
