import { Heading, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { Form } from "@formium/types";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

import MainLayout from "~components/MainLayout";
import { formium } from "~helpers/formium";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { Position, User } from "~helpers/types";

const FORMS = ["moderator-application", "ban-appeal"];

type FormCardProps = {
  form: Form;
};

const FormCard = ({ form }: FormCardProps) => (
  <Link href={`/a/${form.slug}`}>
    <a>
      <HStack
        borderWidth={1}
        rounded="md"
        p="4"
        transition="all 0.2s"
        _hover={{ backgroundColor: "gray.100" }}
      >
        <Text fontSize="md" flex="1">
          {form.name}
        </Text>
        <Icon as={HiChevronRight} />
      </HStack>
    </a>
  </Link>
);

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

export const getServerSideProps = withServerSideSession<DashboardProps>(
  async ({ req }) => {
    const user = req.session.get<User>("user");
    if (!user) throw new Error("User not found");

    const forms = await Promise.all(FORMS.map((x) => formium.getFormBySlug(x)));
    return {
      props: {
        user,
        forms,
      },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.ADMIN
);
