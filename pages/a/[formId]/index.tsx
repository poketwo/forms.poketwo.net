import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  Box,
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FormiumForm } from "@formium/react";
import { Form } from "@formium/types";
import Link from "next/link";
import { useState } from "react";

import components from "~components/formium";
import ErrorAlert from "~components/formium/ErrorAlert";
import MainLayout from "~components/layouts/MainLayout";
import { fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { SubmissionStatus, User } from "~helpers/types";
import { delay } from "~helpers/utils";

const MARKED_ALERT_STATUS = [
  "info",
  (form: Form) => `${form.name} Submitted`,
  (form: Form) =>
    `Your ${form.name} has been submitted and is under review. We will get back to you soon.`,
] as const;

const ALERT_STATUS: {
  [key in SubmissionStatus]: readonly [AlertStatus, (form: Form) => string, (form: Form) => string];
} = {
  [SubmissionStatus.UNDER_REVIEW]: [
    "info",
    (form) => `${form.name} Submitted`,
    (form) =>
      `Your ${form.name} has been submitted and is under review. We will get back to you soon.`,
  ],
  [SubmissionStatus.ACCEPTED]: [
    "success",
    (form) => `${form.name} Accepted`,
    (form) => `Your ${form.name} has been accepted.`,
  ],
  [SubmissionStatus.REJECTED]: [
    "error",
    (form) => `${form.name} Rejected`,
    (form) =>
      `Sorry, your ${form.name} has been rejected. Please do not contact staff members for details.`,
  ],
  [SubmissionStatus.MARKED_ORANGE]: MARKED_ALERT_STATUS,
  [SubmissionStatus.MARKED_YELLOW]: MARKED_ALERT_STATUS,
  [SubmissionStatus.MARKED_BLUE]: MARKED_ALERT_STATUS,
  [SubmissionStatus.MARKED_PURPLE]: MARKED_ALERT_STATUS,
};

const COOLDOWN_MONTHS = 6;

const getCooldownText = (submissionTimestamp: number | null): string | null => {
  if (!submissionTimestamp) return null;
  const submissionDate = new Date(submissionTimestamp);
  const cooldownEnd = new Date(submissionDate);
  cooldownEnd.setMonth(cooldownEnd.getMonth() + COOLDOWN_MONTHS);
  const now = new Date();
  if (now >= cooldownEnd) return null;

  const diffMs = cooldownEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 30) {
    const months = Math.ceil(diffDays / 30);
    return `You can submit again in approximately ${months} month${months === 1 ? "" : "s"}.`;
  }
  return `You can submit again in ${diffDays} day${diffDays === 1 ? "" : "s"}.`;
};

type SuccessProps = {
  form: Form;
  status: SubmissionStatus;
  submissionTimestamp: number | null;
};

const Success = ({ form, status, submissionTimestamp }: SuccessProps) => {
  const cooldownText = getCooldownText(submissionTimestamp);

  return (
    <Stack spacing="4" align="center">
      <Alert
        maxW="3xl"
        mx="auto"
        p="8"
        status={ALERT_STATUS[status][0]}
        flexDirection="column"
        textAlign="center"
        rounded="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {ALERT_STATUS[status][1](form)}
        </AlertTitle>
        <AlertDescription maxW="sm">{ALERT_STATUS[status][2](form)}</AlertDescription>
        {cooldownText && (
          <Text mt="3" fontSize="sm" color="gray.500">
            {cooldownText}
          </Text>
        )}
      </Alert>
      <Link href={`/my-submissions/${form.slug}`} passHref legacyBehavior>
        <Button as="a" variant="outline" size="sm">
          View My Submissions
        </Button>
      </Link>
    </Stack>
  );
};

const NOT_SUSPENDED_STATUS: readonly [AlertStatus, string, string] = [
  "info",
  "You are not suspended",
  "You can only appeal if you are permanently suspended. We do not accept appeals for temporary suspensions, if that is your case.",
];

const NotSuspended = () => (
  <Alert
    maxW="3xl"
    mx="auto"
    p="8"
    status={NOT_SUSPENDED_STATUS[0]}
    flexDirection="column"
    textAlign="center"
    rounded="lg"
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">
      {NOT_SUSPENDED_STATUS[1]}
    </AlertTitle>
    <AlertDescription maxW="sm">{NOT_SUSPENDED_STATUS[2]}</AlertDescription>
  </Alert>
);

type FormPageProps = {
  form: Form;
  user: User;
  previous: SubmissionStatus | null;
  submissionTimestamp: number | null;
  suspended: boolean;
};

const FormContent = ({ form, previous, submissionTimestamp, suspended }: FormPageProps) => {
  const [status, setStatus] = useState(previous);
  const [error, setError] = useState<Error | undefined>();

  const handleSubmit = async (values: any) => {
    try {
      await delay(300);
      await fetch(`/api/forms/${form.slug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setStatus(SubmissionStatus.UNDER_REVIEW);
    } catch (e) {
      setError(e as Error);
    }
  };

  if (status !== null) {
    return (
      <Success
        form={form}
        status={status}
        submissionTimestamp={status === previous ? submissionTimestamp : Date.now()}
      />
    );
  }

  if (form.slug === "suspension-appeal" && !suspended) {
    return <NotSuspended />;
  }

  return (
    <>
      <FormiumForm data={form} components={components} onSubmit={handleSubmit} />
      <ErrorAlert error={error} setError={setError} />
    </>
  );
};

const FormPage = (props: FormPageProps) => (
  <MainLayout user={props.user}>
    <Box maxW="3xl" mx="auto">
      <FormContent key={props.form.id} {...props} />
    </Box>
  </MainLayout>
);

export default FormPage;

export const getServerSideProps = withServerSideSession<FormPageProps>(async ({ req, params }) => {
  const id = params?.formId?.toString();
  const user = req.session.user;
  const poketwoMember = req.session.poketwoMember;

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

  const _submissions = await fetchSubmissions(form.slug, { userId: user.id, onlyRecent: true });
  const submissions = await _submissions.limit(1).toArray();
  const previous =
    submissions.length > 0 ? submissions[0].status ?? SubmissionStatus.UNDER_REVIEW : null;
  const submissionTimestamp =
    submissions.length > 0
      ? parseInt(submissions[0]._id.toString().substring(0, 8), 16) * 1000
      : null;
  const suspended = poketwoMember?.suspended ?? false;

  return {
    props: {
      form,
      user,
      previous,
      submissionTimestamp,
      suspended,
    },
  };
}, AuthMode.AUTHENTICATED);
