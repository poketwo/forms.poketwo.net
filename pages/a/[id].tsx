import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@chakra-ui/alert";
import { Box } from "@chakra-ui/layout";
import { Results } from "@formium/client";
import { FormiumForm } from "@formium/react";
import { Form, Submit } from "@formium/types";
import React from "react";
import NoSSR from "react-no-ssr";

import MainLayout from "~components/MainLayout";
import components from "~components/formium";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { User } from "~helpers/types";

type FormPageProps = {
  id: string;
  form: Form;
  user: User;
  previous: Submit | null;
};

const FormPage = ({ id, form, user, previous }: FormPageProps) => {
  const handleSubmit = async (values: any) => {
    await formium.submitForm(id, {
      ...values,
      discordTag: `${user.username}#${user.discriminator}`,
      discordUserId: user.id,
    });

    alert("Success");
  };

  if (previous) {
    return (
      <MainLayout user={user}>
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
            Your {form.name} has been submitted and is under review. Our team will get back to you
            soon.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <Box maxW="3xl" mx="auto">
        <NoSSR>
          <FormiumForm key={form.id} data={form} components={components} onSubmit={handleSubmit} />
        </NoSSR>
      </Box>
    </MainLayout>
  );
};

export default FormPage;

export const getServerSideProps = withServerSideSession<FormPageProps>(async ({ req, params }) => {
  const id = params.id.toString();
  const user = req.session.get<User>("user");
  const form = await formium.getFormBySlug(id);

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
}, AuthMode.REQUIRE_AUTH);
