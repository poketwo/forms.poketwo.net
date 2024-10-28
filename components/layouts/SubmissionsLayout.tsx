import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Form } from "@formium/types";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import * as querystring from "querystring";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { HiCheck, HiChevronLeft, HiChevronRight, HiFlag, HiSearch, HiX } from "react-icons/hi";

import { SerializableSubmission, SubmissionStatus } from "~helpers/types";

import MainLayout, { MainLayoutProps } from "./MainLayout";

const SORT_ORDER: { [key in SubmissionStatus]: number } = {
  [SubmissionStatus.MARKED_ORANGE]: 0,
  [SubmissionStatus.MARKED_YELLOW]: 1,
  [SubmissionStatus.MARKED_BLUE]: 2,
  [SubmissionStatus.MARKED_PURPLE]: 3,
  [SubmissionStatus.UNDER_REVIEW]: 4,
  [SubmissionStatus.ACCEPTED]: 5,
  [SubmissionStatus.REJECTED]: 6,
};

type SubmissionItemProps = {
  submission: SerializableSubmission;
};

const SubmissionItem = forwardRef<HTMLDivElement, SubmissionItemProps>(
  ({ submission }: SubmissionItemProps, ref) => {
    const { query, asPath } = useRouter();
    const { formId, submissionId, ...newQuery } = query;

    const href = `/a/${formId}/submissions/${submission._id}?${querystring.stringify(newQuery)}`;
    const activeBg = useColorModeValue("gray.100", "gray.700");

    return (
      <Link href={href} passHref legacyBehavior>
        <HStack
          as="a"
          px="6"
          py="1"
          transition="all 0.2s"
          bg={asPath.startsWith(href) ? activeBg : undefined}
          _hover={{ backgroundColor: activeBg }}
          ref={ref}
        >
          <Box flex="1">
            <Text fontWeight="bold">{submission.user_tag}</Text>
            <Text color="gray.500" isTruncated>
              {submission.user_id}
            </Text>
          </Box>

          {submission.status === SubmissionStatus.ACCEPTED && (
            <Icon as={HiCheck} color="green.500" />
          )}
          {submission.status === SubmissionStatus.MARKED_ORANGE && <Icon as={HiFlag} color="orange.500" />}
          {submission.status === SubmissionStatus.MARKED_YELLOW && <Icon as={HiFlag} color="yellow.500" />}
          {submission.status === SubmissionStatus.MARKED_BLUE && <Icon as={HiFlag} color="blue.500" />}
          {submission.status === SubmissionStatus.MARKED_PURPLE && <Icon as={HiFlag} color="purple.500" />}
          {submission.status === SubmissionStatus.REJECTED && <Icon as={HiX} color="red.500" />}
        </HStack>
      </Link>
    );
  },
);

const FilterForm = () => {
  const { query } = useRouter();
  return (
    <Stack as="form" px="6">
      <Input name="userId" defaultValue={query.userId} size="sm" placeholder="Enter User ID" />
      <HStack>
        <Select name="status" defaultValue={query.status} size="sm" placeholder="Select Status">
          <option value={SubmissionStatus.UNDER_REVIEW}>New</option>
          <option value={SubmissionStatus.ACCEPTED}>Accepted</option>
          <option value={SubmissionStatus.REJECTED}>Rejected</option>
          <option value={SubmissionStatus.MARKED_ORANGE}>Marked for Review (Orange)</option>
          <option value={SubmissionStatus.MARKED_YELLOW}>Marked for Review (Yellow)</option>
          <option value={SubmissionStatus.MARKED_BLUE}>Marked for Review (Blue)</option>
          <option value={SubmissionStatus.MARKED_PURPLE}>Marked for Review (Purple)</option>
        </Select>
        <IconButton type="submit" aria-label="Search" icon={<HiSearch />} size="sm" />
      </HStack>
    </Stack>
  );
};

type PaginationProps = {
  page: number;
  href: string;
  count: number;
};

const Pagination = ({ page, href, count }: PaginationProps) => (
  <HStack>
    <Link href={page > 1 ? `${href}?page=${page - 1}` : "#"} passHref legacyBehavior>
      <IconButton
        as="a"
        flex="1"
        borderRadius="0"
        variant="ghost"
        aria-label="Previous page"
        icon={<HiChevronLeft />}
        disabled={page <= 1}
      />
    </Link>
    <Link href={count >= 100 ? `${href}?page=${page + 1}` : "#"} passHref legacyBehavior>
      <IconButton
        as="a"
        flex="1"
        borderRadius="0"
        variant="ghost"
        aria-label="Next page"
        icon={<HiChevronRight />}
        disabled={count < 100}
      />
    </Link>
  </HStack>
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
  const { query } = useRouter();
  const page = Number(query.page ?? 1);
  const href = `/a/${query.formId}/submissions`;

  const ref = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () =>
      [...submissions].sort(
        (a, b) =>
          SORT_ORDER[a.status ?? SubmissionStatus.UNDER_REVIEW] -
          SORT_ORDER[b.status ?? SubmissionStatus.UNDER_REVIEW],
      ),
    [submissions],
  );

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "center" });
  }, [submission]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  return (
    <MainLayout user={user} contentContainerProps={{ p: "0", overflow: "hidden" }}>
      <HStack
        h="12"
        px="6"
        shadow={shadow}
        display={{ base: "flex", lg: "none" }}
        position="relative"
        zIndex={3}
      >
        <IconButton
          aria-label="Toggle navigation"
          variant="ghost"
          icon={<HamburgerIcon boxSize={6} />}
          onClick={onOpen}
        />
        <Heading size="sm">{form.name}</Heading>
      </HStack>

      <Flex h="full">
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{form.name}</DrawerHeader>
            <DrawerBody px="0">
              <Stack spacing={4}>
                <FilterForm />
                <Stack h="full" spacing="0" divider={<Divider />}>
                  {sorted.map((x) => (
                    <SubmissionItem
                      key={x._id}
                      submission={x}
                      ref={x._id === submission?._id ? ref : undefined}
                    />
                  ))}
                  <Pagination page={page} href={href} count={sorted.length} />
                </Stack>
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Stack
          spacing="0"
          divider={<Divider />}
          w="96"
          shadow={shadow}
          overflow="auto"
          bg={bg}
          zIndex={2}
          display={{ base: "none", lg: "flex" }}
        >
          <Stack py="4" spacing="4">
            <Link href={href} passHref legacyBehavior>
              <Heading as="a" mx="6" size="md">
                {form.name}
              </Heading>
            </Link>
            <FilterForm />
          </Stack>

          {sorted.map((x) => (
            <SubmissionItem
              key={x._id}
              submission={x}
              ref={x._id === submission?._id ? ref : undefined}
            />
          ))}

          <Pagination page={page} href={href} count={sorted.length} />
        </Stack>

        <Box flex="1" p="6" overflow="auto" {...contentContainerProps}>
          {children}
        </Box>
      </Flex>
    </MainLayout>
  );
};

export default SubmissionsLayout;
