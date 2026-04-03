import {
  Badge,
  Box,
  Heading,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

import MainLayout from "~components/layouts/MainLayout";
import { fetchUserSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SubmissionStatus, User, makeSerializable } from "~helpers/types";

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

type FormSummary = {
  formSlug: string;
  formName: string;
  count: number;
  latestStatus: SubmissionStatus;
};

type FormCardProps = {
  form: FormSummary;
};

const FormCard = ({ form }: FormCardProps) => {
  const shadow = useColorModeValue("base", "md");
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Link href={`/my-submissions/${form.formSlug}`} passHref legacyBehavior>
      <HStack
        as="a"
        shadow={shadow}
        bg={bg}
        rounded="md"
        p="4"
        spacing="4"
        _hover={{ shadow: "lg" }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Box flex="1">
          <Text fontSize="md" fontWeight="bold">
            {form.formName}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {form.count} submission{form.count === 1 ? "" : "s"}
          </Text>
        </Box>
        <Badge colorScheme={STATUS_COLORS[form.latestStatus]}>
          {STATUS_LABELS[form.latestStatus]}
        </Badge>
        <Box color="gray.400">
          <HiChevronRight />
        </Box>
      </HStack>
    </Link>
  );
};

type MySubmissionsProps = {
  user: User;
  forms: FormSummary[];
};

const MySubmissions = ({ user, forms }: MySubmissionsProps) => {
  return (
    <MainLayout user={user}>
      <Stack spacing="4" maxW="xl" mx="auto">
        <Heading mb="2">My Submissions</Heading>

        {forms.length === 0 ? (
          <Text color="gray.500">You have not submitted any forms yet.</Text>
        ) : (
          forms.map((form) => <FormCard key={form.formSlug} form={form} />)
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

  const formResults = await Promise.allSettled(FORMS.map((slug) => formium.getFormBySlug(slug)));
  const formNames: { [key: string]: string } = {};
  formResults.forEach((result, i) => {
    if (result.status === "fulfilled") {
      formNames[FORMS[i]] = result.value.name;
    }
  });

  // Count submissions per form and get latest status
  const byForm: { [formId: string]: { count: number; latestStatus: SubmissionStatus } } = {};
  for (const sub of serialized) {
    if (!byForm[sub.form_id]) {
      byForm[sub.form_id] = {
        count: 0,
        latestStatus: sub.status ?? SubmissionStatus.UNDER_REVIEW,
      };
    }
    byForm[sub.form_id].count++;
  }

  const forms: FormSummary[] = [];
  for (const formSlug of Object.keys(byForm)) {
    forms.push({
      formSlug,
      formName: formNames[formSlug] ?? formSlug,
      count: byForm[formSlug].count,
      latestStatus: byForm[formSlug].latestStatus,
    });
  }

  return {
    props: {
      user,
      forms,
    },
  };
}, AuthMode.AUTHENTICATED);
