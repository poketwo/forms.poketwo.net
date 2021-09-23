import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/layout";
import { Form } from "@formium/types";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";

import MainLayout, { MainLayoutProps } from "./MainLayout";

import { SerializableSubmission } from "~helpers/types";

type SubmissionCardProps = {
  submission: SerializableSubmission;
};

const SubmissionCard = ({ submission }: SubmissionCardProps) => {
  const { query, asPath } = useRouter();
  const { formId } = query;

  const href = `/a/${formId}/submissions/${submission._id}`;

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
          <Text fontWeight="bold">{submission.user_tag}</Text>
          <Text color="gray.500" isTruncated>
            {submission.email}
          </Text>
        </Box>
      </a>
    </Link>
  );
};

type SubmissionsLayoutProps = MainLayoutProps & {
  form: Form;
  submissions: SerializableSubmission[];
};

const SubmissionsLayout = ({
  user,
  form,
  submissions,
  contentContainerProps,
  children,
}: SubmissionsLayoutProps) => {
  return (
    <MainLayout user={user} contentContainerProps={{ p: "0", overflow: "hidden" }}>
      <Flex h="full">
        <Stack spacing="4" w="96" p="6" borderRightWidth={1} overflow="scroll">
          <Heading size="md">{form.name}</Heading>

          {submissions.map((x) => (
            <SubmissionCard key={x._id} submission={x} />
          ))}
        </Stack>

        <Box flex="1" bg="white" p="6" overflow="scroll" {...contentContainerProps}>
          {children}
        </Box>
      </Flex>
    </MainLayout>
  );
};

export default SubmissionsLayout;
