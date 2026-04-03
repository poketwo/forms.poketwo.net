import { Alert, AlertDescription, AlertIcon, Box, Flex, Heading, HStack, Tag, Text, useColorModeValue } from "@chakra-ui/react";
import { Form } from "@formium/types";

import SubmissionContent from "~components/SubmissionContent";
import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import {
  fetchSubmission,
  fetchUserFormSubmissions,
} from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SerializableSubmission, SubmissionStatus, User, makeSerializable } from "~helpers/types";

const STATUS_LABELS: { [key in SubmissionStatus]: string } = {
  [SubmissionStatus.UNDER_REVIEW]: "Under Review",
  [SubmissionStatus.ACCEPTED]: "Accepted",
  [SubmissionStatus.REJECTED]: "Rejected",
  [SubmissionStatus.MARKED_ORANGE]: "Under Review",
  [SubmissionStatus.MARKED_YELLOW]: "Under Review",
  [SubmissionStatus.MARKED_BLUE]: "Under Review",
  [SubmissionStatus.MARKED_PURPLE]: "Under Review",
};

const STATUS_COLORS: { [key in SubmissionStatus]: string } = {
  [SubmissionStatus.UNDER_REVIEW]: "yellow",
  [SubmissionStatus.ACCEPTED]: "green",
  [SubmissionStatus.REJECTED]: "red",
  [SubmissionStatus.MARKED_ORANGE]: "yellow",
  [SubmissionStatus.MARKED_YELLOW]: "yellow",
  [SubmissionStatus.MARKED_BLUE]: "yellow",
  [SubmissionStatus.MARKED_PURPLE]: "yellow",
};

const getDateFromObjectId = (id: string): string => {
  const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

type UserSubmissionPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
  submission: SerializableSubmission;
};

const UserSubmissionPage = ({
  user,
  form,
  submissions,
  submission,
}: UserSubmissionPageProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");
  const status = submission.status ?? SubmissionStatus.UNDER_REVIEW;

  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submissions={submissions}
      submission={submission}
      baseHref={`/my-submissions/${form.slug}`}
      userMode
      contentContainerProps={{ p: 0 }}
    >
      <Flex direction="column" h="full" overflow="hidden">
        <Box px="6" py="4" shadow={shadow} bg={bg} zIndex={1}>
          <HStack spacing={2}>
            <Heading size="md" flex="1">
              {getDateFromObjectId(submission._id)}
            </Heading>
            <Tag size="lg" colorScheme={STATUS_COLORS[status]}>
              {STATUS_LABELS[status]}
            </Tag>
          </HStack>
          {submission.comment && (
            <Alert
              mt="3"
              status={status === SubmissionStatus.ACCEPTED ? "success" : status === SubmissionStatus.REJECTED ? "error" : "info"}
              variant="left-accent"
              rounded="md"
              py="3"
            >
              <AlertIcon />
              <AlertDescription fontSize="sm" fontWeight="medium">
                {submission.comment}
              </AlertDescription>
            </Alert>
          )}
        </Box>
        <Box flex="1" overflow="auto" p="6" zIndex={0}>
          <SubmissionContent
            key={form.id}
            form={form}
            submission={submission}
          />
        </Box>
      </Flex>
    </SubmissionsLayout>
  );
};

export default UserSubmissionPage;

type UserSubmissionPageQuery = {
  formId: string;
  submissionId: string;
};

export const getServerSideProps = withServerSideSession<UserSubmissionPageProps, UserSubmissionPageQuery>(
  async ({ req, params, query }) => {
    if (!params) throw new Error("No params found.");
    const { formId, submissionId } = params;

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

    const submission = await fetchSubmission(submissionId);

    if (!submission) return { notFound: true };

    // Security: ensure the submission belongs to the current user and the correct form
    if (submission.user_id.toString() !== user.id || submission.form_id !== form.slug) {
      return { notFound: true };
    }

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
        submission: {
          ...makeSerializable(submission),
          reviewer_id: null,
          email: null,
        },
      },
    };
  },
  AuthMode.AUTHENTICATED,
);
