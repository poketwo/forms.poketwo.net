import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Checkbox,
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
  Tag,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Form } from "@formium/types";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import * as querystring from "querystring";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import {
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiFlag,
  HiSearch,
  HiVideoCamera,
  HiX,
} from "react-icons/hi";

import { SerializableSubmission, SubmissionStatus } from "~helpers/types";
import {
  VIDEO_EVIDENCE_FIELD,
  normalizeVideoEvidenceLinks,
  supportsVideoEvidence,
} from "~helpers/videoEvidence";

import MainLayout, { MainLayoutProps } from "./MainLayout";

const SORT_ORDER: { [key in SubmissionStatus]: number } = {
  [SubmissionStatus.MARKED_ORANGE]: 0,
  [SubmissionStatus.MARKED_YELLOW]: 1,
  [SubmissionStatus.MARKED_BLUE]: 2,
  [SubmissionStatus.MARKED_PURPLE]: 3,
  [SubmissionStatus.MARKED_RED]: 4,
  [SubmissionStatus.UNDER_REVIEW]: 5,
  [SubmissionStatus.ACCEPTED]: 6,
  [SubmissionStatus.REJECTED]: 7,
};

const STATUS_LABELS: { [key in SubmissionStatus]: string } = {
  [SubmissionStatus.UNDER_REVIEW]: "Under Review",
  [SubmissionStatus.ACCEPTED]: "Accepted",
  [SubmissionStatus.REJECTED]: "Rejected",
  [SubmissionStatus.MARKED_ORANGE]: "Under Review",
  [SubmissionStatus.MARKED_YELLOW]: "Under Review",
  [SubmissionStatus.MARKED_BLUE]: "Under Review",
  [SubmissionStatus.MARKED_PURPLE]: "Under Review",
  [SubmissionStatus.MARKED_RED]: "Under Review",
};

const STATUS_COLORS: { [key in SubmissionStatus]: string } = {
  [SubmissionStatus.UNDER_REVIEW]: "yellow",
  [SubmissionStatus.ACCEPTED]: "green",
  [SubmissionStatus.REJECTED]: "red",
  [SubmissionStatus.MARKED_ORANGE]: "yellow",
  [SubmissionStatus.MARKED_YELLOW]: "yellow",
  [SubmissionStatus.MARKED_BLUE]: "yellow",
  [SubmissionStatus.MARKED_PURPLE]: "yellow",
  [SubmissionStatus.MARKED_RED]: "yellow",
};

const getDateFromObjectId = (id: string): string => {
  const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type SubmissionItemProps = {
  submission: SerializableSubmission;
  baseHref: string;
  showVideoEvidence: boolean;
  userMode?: boolean;
};

const SubmissionItem = forwardRef<HTMLDivElement, SubmissionItemProps>(
  ({ submission, baseHref, showVideoEvidence, userMode }: SubmissionItemProps, ref) => {
    const { query, asPath } = useRouter();
    const { formId, submissionId, ...newQuery } = query;

    const href = `${baseHref}/${submission._id}?${querystring.stringify(newQuery)}`;
    const activeBg = useColorModeValue("gray.100", "gray.700");
    const status = submission.status ?? SubmissionStatus.UNDER_REVIEW;
    const hasVideoEvidence =
      showVideoEvidence &&
      normalizeVideoEvidenceLinks(submission.data[VIDEO_EVIDENCE_FIELD]).length > 0;

    return (
      <Link href={href} passHref legacyBehavior>
        <HStack
          as="a"
          px="6"
          py="1"
          transition="all 0.2s"
          bg={asPath.startsWith(href.split("?")[0]) ? activeBg : undefined}
          _hover={{ backgroundColor: activeBg }}
          ref={ref}
        >
          <Box flex="1">
            {userMode ? (
              <>
                <Text fontWeight="bold">{getDateFromObjectId(submission._id)}</Text>
                <Text color="gray.500" fontSize="sm">
                  <Tag size="sm" colorScheme={STATUS_COLORS[status]}>
                    {STATUS_LABELS[status]}
                  </Tag>
                </Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold">{submission.user_tag}</Text>
                <Text color="gray.500" isTruncated>
                  {submission.user_id}
                </Text>
              </>
            )}
          </Box>

          {hasVideoEvidence && (
            <Icon
              as={HiVideoCamera}
              boxSize="5"
              color="purple.500"
              aria-label="Has video evidence"
            />
          )}
          {submission.status === SubmissionStatus.ACCEPTED && (
            <Icon as={HiCheck} color="green.500" />
          )}
          {!userMode && submission.status === SubmissionStatus.MARKED_ORANGE && <Icon as={HiFlag} color="orange.500" />}
          {!userMode && submission.status === SubmissionStatus.MARKED_YELLOW && <Icon as={HiFlag} color="yellow.500" />}
          {!userMode && submission.status === SubmissionStatus.MARKED_BLUE && <Icon as={HiFlag} color="blue.500" />}
          {!userMode && submission.status === SubmissionStatus.MARKED_PURPLE && <Icon as={HiFlag} color="purple.500" />}
          {!userMode && submission.status === SubmissionStatus.MARKED_RED && <Icon as={HiFlag} color="red.500" />}
          {submission.status === SubmissionStatus.REJECTED && <Icon as={HiX} color="red.500" />}
        </HStack>
      </Link>
    );
  },
);

type FilterFormProps = {
  showVideoEvidence: boolean;
};

const FilterForm = ({ showVideoEvidence }: FilterFormProps) => {
  const { query } = useRouter();
  return (
    <Stack as="form" px="6">
      <Input name="userId" defaultValue={query.userId} size="sm" placeholder="Enter User ID" />
      {showVideoEvidence && (
        <Checkbox
          name="hasVideoEvidence"
          value="true"
          defaultChecked={query.hasVideoEvidence === "true"}
          size="sm"
        >
          Has video evidence
        </Checkbox>
      )}
      <HStack>
        <Select name="status" defaultValue={query.status} size="sm" placeholder="Select Status">
          <option value={SubmissionStatus.UNDER_REVIEW}>New</option>
          <option value={SubmissionStatus.ACCEPTED}>Accepted</option>
          <option value={SubmissionStatus.REJECTED}>Rejected</option>
          <option value={SubmissionStatus.MARKED_ORANGE}>Marked for Review (Orange)</option>
          <option value={SubmissionStatus.MARKED_YELLOW}>Marked for Review (Yellow)</option>
          <option value={SubmissionStatus.MARKED_BLUE}>Marked for Review (Blue)</option>
          <option value={SubmissionStatus.MARKED_PURPLE}>Marked for Review (Purple)</option>
          <option value={SubmissionStatus.MARKED_RED}>Marked for Review (Red)</option>
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

const Pagination = ({ page, href, count }: PaginationProps) => {
  const { query } = useRouter();
  const pageHref = (targetPage: number) =>
    `${href}?${querystring.stringify({
      page: targetPage,
      ...(query.userId && { userId: query.userId }),
      ...(query.status && { status: query.status }),
      ...(query.hasVideoEvidence && { hasVideoEvidence: query.hasVideoEvidence }),
    })}`;

  return (
    <HStack>
      <Link href={page > 1 ? pageHref(page - 1) : "#"} passHref legacyBehavior>
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
      <Link href={count >= 100 ? pageHref(page + 1) : "#"} passHref legacyBehavior>
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
};

type SubmissionsLayoutProps = MainLayoutProps & {
  form: Form;
  submissions: SerializableSubmission[];
  submission?: SerializableSubmission;
  baseHref?: string;
  userMode?: boolean;
};

const SubmissionsLayout = ({
  user,
  form,
  submissions,
  submission,
  contentContainerProps,
  children,
  baseHref: baseHrefProp,
  userMode,
}: SubmissionsLayoutProps) => {
  const { query } = useRouter();
  const page = Number(query.page ?? 1);
  const baseHref = baseHrefProp ?? `/a/${query.formId}/submissions`;
  const showVideoEvidence = !userMode && supportsVideoEvidence(form.slug);

  const ref = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () =>
      userMode
        ? submissions
        : [...submissions].sort(
            (a, b) =>
              SORT_ORDER[a.status ?? SubmissionStatus.UNDER_REVIEW] -
              SORT_ORDER[b.status ?? SubmissionStatus.UNDER_REVIEW],
          ),
    [submissions, userMode],
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
                {!userMode && <FilterForm showVideoEvidence={showVideoEvidence} />}
                <Stack h="full" spacing="0" divider={<Divider />}>
                  {sorted.map((x) => (
                    <SubmissionItem
                      key={x._id}
                      submission={x}
                      baseHref={baseHref}
                      showVideoEvidence={showVideoEvidence}
                      userMode={userMode}
                      ref={x._id === submission?._id ? ref : undefined}
                    />
                  ))}
                  <Pagination page={page} href={baseHref} count={sorted.length} />
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
            <Link href={baseHref} passHref legacyBehavior>
              <Heading as="a" mx="6" size="md">
                {form.name}
              </Heading>
            </Link>
            {!userMode && <FilterForm showVideoEvidence={showVideoEvidence} />}
          </Stack>

          {sorted.map((x) => (
            <SubmissionItem
              key={x._id}
              submission={x}
              baseHref={baseHref}
              showVideoEvidence={showVideoEvidence}
              userMode={userMode}
              ref={x._id === submission?._id ? ref : undefined}
            />
          ))}

          <Pagination page={page} href={baseHref} count={sorted.length} />
        </Stack>

        <Box flex="1" p="6" overflow="auto" {...contentContainerProps}>
          {children}
        </Box>
      </Flex>
    </MainLayout>
  );
};

export default SubmissionsLayout;
