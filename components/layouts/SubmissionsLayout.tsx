import { Box, Divider, Flex, Heading, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { Form } from "@formium/types";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { HiCheck, HiFlag, HiX } from "react-icons/hi";

import MainLayout, { MainLayoutProps } from "./MainLayout";

import { SerializableSubmission, SubmissionStatus } from "~helpers/types";

const SORT_ORDER: { [key in SubmissionStatus]: number } = {
  [SubmissionStatus.MARKED]: 0,
  [SubmissionStatus.UNDER_REVIEW]: 1,
  [SubmissionStatus.ACCEPTED]: 2,
  [SubmissionStatus.REJECTED]: 3,
};

type SubmissionItemProps = {
  submission: SerializableSubmission;
};

const SubmissionItem = forwardRef<HTMLDivElement, SubmissionItemProps>(
  ({ submission }: SubmissionItemProps, ref) => {
    const { query, asPath } = useRouter();
    const { formId } = query;

    const href = `/a/${formId}/submissions/${submission._id}`;

    return (
      <Link href={href}>
        <a>
          <HStack
            px="6"
            py="1"
            transition="all 0.2s"
            bg={asPath.startsWith(href) ? "gray.100" : undefined}
            _hover={{ backgroundColor: "gray.100" }}
            ref={ref}
          >
            <Box flex="1">
              <Text fontWeight="bold">{submission.user_tag}</Text>
              <Text color="gray.500" isTruncated>
                {submission.email}
              </Text>
            </Box>

            {submission.status === SubmissionStatus.ACCEPTED && (
              <Icon as={HiCheck} color="green.500" />
            )}
            {submission.status === SubmissionStatus.MARKED && <Icon as={HiFlag} color="blue.500" />}
            {submission.status === SubmissionStatus.REJECTED && <Icon as={HiX} color="red.500" />}
          </HStack>
        </a>
      </Link>
    );
  }
);

type SubmissionsLayoutProps = MainLayoutProps & {
  form: Form;
  submissions: SerializableSubmission[];
  submission?: SerializableSubmission;
};

const SubmissionsLayout = ({
  user,
  form,
  submissions,
  submission,
  contentContainerProps,
  children,
}: SubmissionsLayoutProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () =>
      [...submissions].sort(
        (a, b) =>
          SORT_ORDER[a.status ?? SubmissionStatus.UNDER_REVIEW] -
          SORT_ORDER[b.status ?? SubmissionStatus.UNDER_REVIEW]
      ),
    [submissions]
  );

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [submission]);

  return (
    <MainLayout user={user} contentContainerProps={{ p: "0", overflow: "hidden" }}>
      <Flex h="full">
        <Stack spacing="0" divider={<Divider />} w="96" shadow="base" overflow="scroll">
          <Heading m="6" size="md">
            {form.name}
          </Heading>

          {sorted.map((x) => (
            <SubmissionItem
              key={x._id}
              submission={x}
              ref={x._id === submission?._id ? ref : undefined}
            />
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
