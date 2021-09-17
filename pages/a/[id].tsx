import { Box } from "@chakra-ui/layout";
import { FormiumForm } from "@formium/react";
import { Form } from "@formium/types";
import React from "react";

import MainLayout from "~components/MainLayout";
import components from "~components/formium";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { User } from "~helpers/types";

type FormPageProps = {
  id: string;
  form: Form;
  user: User;
};

const FormPage = ({ id, form, user }: FormPageProps) => {
  const handleSubmit = async (values: any) => {
    await formium.submitForm(id, values);
    alert("Success");
  };

  return (
    <MainLayout user={user}>
      <Box maxW="3xl" mx="auto">
        <FormiumForm key={form.id} data={form} components={components} onSubmit={handleSubmit} />
      </Box>
    </MainLayout>
  );
};

export default FormPage;

export const getServerSideProps = withServerSideSession<FormPageProps>(async ({ req, params }) => {
  const id = params.id.toString();
  const user = req.session.get<User>("user");
  const form = await formium.getFormBySlug(id);
  return { props: { id, form, user } };
}, AuthMode.REQUIRE_AUTH);
