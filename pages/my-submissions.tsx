import {
  Badge,
  Box,
  Heading,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form } from "@formium/types";
import Link from "next/link";

import MainLayout from "~components/layouts/MainLayout";
import { fetchUserSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SerializableSubmission, SubmissionStatus, User, makeSerializable } from "~helpers/types";

const FORMS = ["moderator-application", "ban-appeal", "suspension-appeal"];

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

type SubmissionCardProps = {
  submission: SerializableSubmission;
  formName: string;
};

const SubmissionCard = ({ submission, formName }: SubmissionCardProps) => {
  const shadow = useColorModeValue("base", "md");
  const bg = useColorModeValue("white", "gray.800");
  const status = submission.status ?? SubmissionStatus.UNDER_REVIEW;

  return (
    <Stack shadow={shadow} bg={bg} rounded="md" p="4" spacing="3">
      <HStack justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Text fontSize="md" fontWeight="bold">
            {formName}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {getDateFromObjectId(submission._id)}
          </Text>
        </Box>
        <Badge colorScheme={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
      </HStack>
      {submission.comment && (
        <Box borderLeftWidth="2px" borderColor="gray.500" pl="3">
          <Text fontSize="sm" color="gray.400">
            Reviewer Comment
          </Text>
          <Text fontSize="sm">{submission.comment}</Text>
        </Box>
      )}
    </Stack>
  );
};

type MySubmissionsProps = {
  user: User;
  submissions: SerializableSubmission[];
  formNames: { [key: string]: string };
};

const MySubmissions = ({ user, submissions, formNames }: MySubmissionsProps) => {
  return (
    <MainLayout user={user}>
      <Stack spacing="4" maxW="xl" mx="auto">
        <Heading mb="2">My Submissions</Heading>

        {submissions.length === 0 ? (
          <Text color="gray.500">You have not submitted any forms yet.</Text>
        ) : (
          submissions.map((submission) => (
            <SubmissionCard
              key={submission._id}
              submission={submission}
              formName={formNames[submission.form_id] ?? submission.form_id}
            />
          ))
        )}
      </Stack>
    </MainLayout>
  );
};

export default MySubmissions;

export const getServerSideProps = withServerSideSession<MySubmissionsProps>(async ({ req }) => {
  const user = req.session.user;
  if (!user) throw new Error("User not found");

  const _submissions = await fetchUserSubmissions(user.id);
  const submissions = await _submissions.toArray();

  const forms = await Promise.allSettled(FORMS.map((slug) => formium.getFormBySlug(slug)));
  const formNames: { [key: string]: string } = {};
  forms.forEach((result, i) => {
    if (result.status === "fulfilled") {
      formNames[FORMS[i]] = result.value.name;
    }
  });

  return {
    props: {
      user,
      submissions: submissions.map(makeSerializable),
      formNames,
    },
  };
}, AuthMode.AUTHENTICATED);
