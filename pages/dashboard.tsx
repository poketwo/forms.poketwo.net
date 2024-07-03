import { Heading, HStack, Icon, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Form } from "@formium/types";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

import MainLayout from "~components/layouts/MainLayout";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { User } from "~helpers/types";

const FORMS = ["moderator-application", "ban-appeal", "suspension-appeal"];

type FormCardProps = {
  form: Form;
};

const FormCard = ({ form }: FormCardProps) => {
  const shadow = useColorModeValue("base", "md");
  return (
    <Link href={`/a/${form.slug}`} passHref legacyBehavior>
      <HStack as="a" shadow={shadow} rounded="md" p="4" transition="all 0.2s" _hover={{ shadow: "lg" }}>
        <Text fontSize="md" flex="1">
          {form.name}
        </Text>
        <Icon as={HiChevronRight} />
      </HStack>
    </Link>
  );
};

type DashboardProps = {
  user: User;
  forms: Form[];
};

const Dashboard = ({ user, forms }: DashboardProps) => {
  return (
    <MainLayout user={user}>
      <Stack spacing="4" maxW="xl" mx="auto">
        <Heading mb="2">Available Forms</Heading>

        {forms.map((x) => (
          <FormCard key={x.id} form={x} />
        ))}
      </Stack>
    </MainLayout>
  );
};

export default Dashboard;

export const getServerSideProps = withServerSideSession<DashboardProps>(async ({ req }) => {
  const user = req.session.user;
  if (!user) throw new Error("User not found");

  const forms = await Promise.all(FORMS.map((x) => formium.getFormBySlug(x)));
  return {
    props: {
      user,
      forms,
    },
  };
}, AuthMode.AUTHENTICATED);
