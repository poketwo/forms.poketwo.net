import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

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
};

const SubmissionCard = ({ submission }: SubmissionCardProps) => {
  const shadow = useColorModeValue("base", "md");
  const bg = useColorModeValue("white", "gray.800");
  const status = submission.status ?? SubmissionStatus.UNDER_REVIEW;

  return (
    <Stack shadow={shadow} bg={bg} rounded="md" p="4" spacing="3">
      <HStack justifyContent="space-between" alignItems="flex-start">
        <Text fontSize="sm" color="gray.500">
          {getDateFromObjectId(submission._id)}
        </Text>
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

type PriorRejectionProps = {
  submission: SerializableSubmission;
};

const PriorRejection = ({ submission }: PriorRejectionProps) => {
  return (
    <Stack spacing="1" py="2">
      <HStack>
        <Tag colorScheme="red" size="sm">
          Rejected
        </Tag>
        <Text fontSize="sm" color="gray.500">
          {getDateFromObjectId(submission._id)}
        </Text>
      </HStack>
      <Text fontSize="sm">{submission.comment ?? "No comment provided."}</Text>
    </Stack>
  );
};

type FormGroup = {
  formSlug: string;
  formName: string;
  latest: SerializableSubmission;
  priorRejections: SerializableSubmission[];
};

type FormGroupCardProps = {
  group: FormGroup;
};

const FormGroupCard = ({ group }: FormGroupCardProps) => {
  const shadow = useColorModeValue("base", "md");
  const bg = useColorModeValue("white", "gray.800");
  const latestStatus = group.latest.status ?? SubmissionStatus.UNDER_REVIEW;

  return (
    <Stack shadow={shadow} bg={bg} rounded="md" p="4" spacing="4">
      <HStack justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Text fontSize="md" fontWeight="bold">
            {group.formName}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Latest: {getDateFromObjectId(group.latest._id)}
          </Text>
        </Box>
        <Badge colorScheme={STATUS_COLORS[latestStatus]}>{STATUS_LABELS[latestStatus]}</Badge>
      </HStack>

      {group.latest.comment && (
        <Box borderLeftWidth="2px" borderColor="gray.500" pl="3">
          <Text fontSize="sm" color="gray.400">
            Reviewer Comment
          </Text>
          <Text fontSize="sm">{group.latest.comment}</Text>
        </Box>
      )}

      {latestStatus === SubmissionStatus.REJECTED && (
        <Link href={`/a/${group.formSlug}`} passHref legacyBehavior>
          <Button as="a" size="sm" colorScheme="blue" variant="outline" rightIcon={<HiChevronRight />}>
            Resubmit
          </Button>
        </Link>
      )}

      {group.priorRejections.length > 0 && (
        <>
          <Divider />
          <Heading size="xs" color="gray.500">
            Prior Rejections
          </Heading>
          {group.priorRejections.map((r) => (
            <PriorRejection key={r._id} submission={r} />
          ))}
        </>
      )}
    </Stack>
  );
};

type MySubmissionsProps = {
  user: User;
  formGroups: FormGroup[];
  ungroupedSubmissions: SerializableSubmission[];
};

const MySubmissions = ({ user, formGroups, ungroupedSubmissions }: MySubmissionsProps) => {
  const hasAny = formGroups.length > 0 || ungroupedSubmissions.length > 0;

  return (
    <MainLayout user={user}>
      <Stack spacing="4" maxW="xl" mx="auto">
        <Heading mb="2">My Submissions</Heading>

        {!hasAny ? (
          <Text color="gray.500">You have not submitted any forms yet.</Text>
        ) : (
          <>
            {formGroups.map((group) => (
              <FormGroupCard key={group.formSlug} group={group} />
            ))}
            {ungroupedSubmissions.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))}
          </>
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
  const serialized = submissions.map(makeSerializable);

  const forms = await Promise.allSettled(FORMS.map((slug) => formium.getFormBySlug(slug)));
  const formNames: { [key: string]: string } = {};
  forms.forEach((result, i) => {
    if (result.status === "fulfilled") {
      formNames[FORMS[i]] = result.value.name;
    }
  });

  // Group submissions by form
  const byForm: { [formId: string]: SerializableSubmission[] } = {};
  const ungroupedSubmissions: SerializableSubmission[] = [];

  for (const sub of serialized) {
    if (FORMS.includes(sub.form_id)) {
      if (!byForm[sub.form_id]) byForm[sub.form_id] = [];
      byForm[sub.form_id].push(sub);
    } else {
      ungroupedSubmissions.push(sub);
    }
  }

  // Build form groups: latest submission + prior rejections
  const formGroups: FormGroup[] = [];
  for (const formSlug of FORMS) {
    const formSubs = byForm[formSlug];
    if (!formSubs || formSubs.length === 0) continue;

    const latest = formSubs[0]; // Already sorted newest-first by fetchUserSubmissions
    const priorRejections = formSubs
      .slice(1)
      .filter((s) => s.status === SubmissionStatus.REJECTED);

    formGroups.push({
      formSlug,
      formName: formNames[formSlug] ?? formSlug,
      latest,
      priorRejections,
    });
  }

  return {
    props: {
      user,
      formGroups,
      ungroupedSubmissions,
    },
  };
}, AuthMode.AUTHENTICATED);
