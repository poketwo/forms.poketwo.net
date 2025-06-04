import { Alert, AlertDescription, AlertIcon, AlertStatus, AlertTitle, Box } from "@chakra-ui/react";
import { FormiumForm } from "@formium/react";
import { Form } from "@formium/types";
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

type SuccessProps = {
  form: Form;
  status: SubmissionStatus;
};

const Success = ({ form, status }: SuccessProps) => (
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
  </Alert>
);

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
  suspended: boolean;
};

const FormContent = ({ form, previous, suspended }: FormPageProps) => {
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
    return <Success form={form} status={status} />;
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
  const suspended = poketwoMember?.suspended ?? false;

  return {
    props: {
      form,
      user,
      previous,
      suspended,
    },
  };
}, AuthMode.AUTHENTICATED);
