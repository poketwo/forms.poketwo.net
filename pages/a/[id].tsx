import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from "@chakra-ui/react";
import { Results } from "@formium/client";
import { FormiumForm } from "@formium/react";
import { Form, Submit } from "@formium/types";
import React, { useState } from "react";
import NoSSR from "react-no-ssr";

import MainLayout from "~components/MainLayout";
import components from "~components/formium";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { User } from "~helpers/types";

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

type FormPageProps = {
  id: string;
  form: Form;
  user: User;
  previous: Submit | null;
};

const FormContent = ({ id, form, user, previous }: FormPageProps) => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    await formium.submitForm(id, {
      ...values,
      discordTag: `${user.username}#${user.discriminator}`,
      discordUserId: user.id,
      email: user.email,
    });
    setSuccess(true);
  };

  if (success || previous) {
    return <Success form={form} />;
  }

  return <FormiumForm data={form} components={components} onSubmit={handleSubmit} />;
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
  const id = params?.id?.toString();
  const user = req.session.get<User>("user");

  if (!id) throw new Error("ID not found");
  if (!user) throw new Error("User not found");

  let form;
  try {
    form = await formium.getFormBySlug(id);
  } catch (e) {
    const err = e as any;
    if (err.status === 404) return { notFound: true };
  }

  if (!form) return { notFound: true };

  const submits: Results<Submit> = (await formium.findSubmits({
    formId: form.id,
    sort: "-createAt",
  })) as any;

  const previous = submits.data.find((x) => x.data.discordUserId === user.id);

  return {
    props: {
      id,
      form,
      user,
      previous: previous ?? null,
    },
  };
}, AuthMode.AUTHENTICATED);
