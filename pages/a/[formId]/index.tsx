import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
} from "@chakra-ui/react";
import { FormiumForm } from "@formium/react";
import { Form } from "@formium/types";
import React, { useRef, useState } from "react";
import NoSSR from "react-no-ssr";

import components from "~components/formium";
import MainLayout from "~components/layouts/MainLayout";
import { fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { User } from "~helpers/types";
import { delay } from "~helpers/utils";

type SuccessProps = {
  form: Form;
};

const Success = ({ form }: SuccessProps) => (
  <Alert
    maxW="3xl"
    mx="auto"
    p="8"
    status="success"
    flexDirection="column"
    textAlign="center"
    rounded="lg"
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">
      {form.name} Submitted
    </AlertTitle>
    <AlertDescription maxW="sm">
      Your {form.name} has been submitted and is under review. Our team will get back to you soon.
    </AlertDescription>
  </Alert>
);

type ErrorAlertProps = {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
};

const ErrorAlert = ({ title, message, isOpen, onClose }: ErrorAlertProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog leastDestructiveRef={ref} onClose={onClose} isOpen={isOpen} isCentered>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>{title}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>{message}</AlertDialogBody>
        <AlertDialogFooter>
          <Button colorScheme="red" ref={ref} onClick={onClose}>
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type FormPageProps = {
  form: Form;
  user: User;
  previous: boolean;
};

const FormContent = ({ form, previous }: FormPageProps) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const handleSubmit = async (values: any) => {
    try {
      await delay(300);
      await fetch(`/api/forms/${form.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSuccess(true);
    } catch (_e) {
      setError(_e as Error);
    }
  };

  if (success || previous) {
    return <Success form={form} />;
  }

  return (
    <>
      <FormiumForm data={form} components={components} onSubmit={handleSubmit} />
      <ErrorAlert
        isOpen={!!error}
        title="Error"
        message={error?.message ?? ""}
        onClose={() => setError(undefined)}
      />
    </>
  );
};

const FormPage = (props: FormPageProps) => (
  <MainLayout user={props.user}>
    <Box maxW="3xl" mx="auto">
      <NoSSR>
        <FormContent key={props.form.id} {...props} />
      </NoSSR>
    </Box>
  </MainLayout>
);

export default FormPage;

export const getServerSideProps = withServerSideSession<FormPageProps>(async ({ req, params }) => {
  const id = params?.formId?.toString();
  const user = req.session.get<User>("user");

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

  const _submissions = await fetchSubmissions(form.id);
  const submissions = await _submissions.limit(1).toArray();

  return {
    props: {
      form,
      user,
      previous: submissions.length > 0,
    },
  };
}, AuthMode.AUTHENTICATED);
