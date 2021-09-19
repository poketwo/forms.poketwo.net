import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/layout";
import { Form, Submit } from "@formium/types";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";

import MainLayout, { MainLayoutProps } from "./MainLayout";

type SubmissionCardProps = {
  submit: Submit;
  primaryKey: string;
  secondaryKey: string;
};

const SubmissionCard = ({ submit, primaryKey, secondaryKey }: SubmissionCardProps) => {
  const { query, asPath } = useRouter();
  const { formId } = query;

  const href = `/a/${formId}/submissions/${submit.id}`;

  return (
    <Link href={href}>
      <a>
        <Box
          borderWidth={1}
          rounded="md"
          p="4"
          transition="all 0.2s"
          bg={asPath.startsWith(href) ? "gray.100" : undefined}
          _hover={{ backgroundColor: "gray.100" }}
        >
          <Text fontWeight="bold">{submit.data[primaryKey]}</Text>
          <Text color="gray.500" isTruncated>
            {submit.data[secondaryKey]}
          </Text>
        </Box>
      </a>
    </Link>
  );
};

type SubmissionsLayoutProps = MainLayoutProps & {
  form: Form;
  submits: Submit[];
  primaryKey: string;
  secondaryKey: string;
};

const SubmissionsLayout = ({
  user,
  form,
  submits,
  primaryKey,
  secondaryKey,
  children,
}: SubmissionsLayoutProps) => {
  return (
    <MainLayout user={user} contentContainerProps={{ p: "0", overflow: "hidden" }}>
      <Flex h="full">
        <Stack spacing="4" w="96" p="8" borderRightWidth={1} overflow="scroll">
          <Heading size="md">{form.name}</Heading>

          {submits.map((x) => (
            <SubmissionCard
              key={x.id}
              submit={x}
              primaryKey={primaryKey}
              secondaryKey={secondaryKey}
            />
          ))}
        </Stack>

        <Box flex="1" bg="white" p="8" overflow="scroll">
          {children}
        </Box>
      </Flex>
    </MainLayout>
  );
};

export default SubmissionsLayout;
