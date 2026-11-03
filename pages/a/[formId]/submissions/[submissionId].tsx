import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  ButtonProps,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  LightMode,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Tag,
  Text,
  Textarea,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form } from "@formium/types";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import { HiCheck, HiFlag, HiX } from "react-icons/hi";

import Link from "next/link";
import PunishmentCard from "~components/PunishmentCard";
import SubmissionContent from "~components/SubmissionContent";
import SubmissionNotes from "~components/SubmissionNotes";
import ErrorAlert from "~components/formium/ErrorAlert";
import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmission, fetchSubmissions, fetchUserFormSubmissions } from "~helpers/db";
import { fetchAccountDeleted } from "~helpers/discord";
import { formium } from "~helpers/formium";
import { getFirstPageFieldSlugs, isAppealForm, isEnabledForm } from "~helpers/form";
import { hasFullAccess, hasFullContentAccess, permittedToViewForm } from "~helpers/permissions";
import { fetchPunishment } from "~helpers/punishment";
import { AuthMode, withServerSideSession } from "~helpers/session";
import {
  FLAG_COLORS,
  Punishment,
  SerializableSubmission,
  SerializableSubmissionNote,
  SubmissionStatus,
  User,
  isFlagStatus,
  makeSerializable,
  makeSerializableNote,
} from "~helpers/types";
import { delay, hasLegacyDiscriminator } from "~helpers/utils";
import { supportsVideoEvidence } from "~helpers/videoEvidence";

type HeaderButtonProps = ButtonProps & {
  icon: ReactElement;
  label: string;
  onClick?: () => Promise<void> | void;
};

const HeaderButton = ({ icon, label, onClick, ...props }: HeaderButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const handleClick = onClick ? async () => {
    try {
      setLoading(true);
      await delay(300);
      await onClick();
    } catch (e) {
      setError(e as Error);
    }
    setLoading(false);
  } : () => {};

  return (
    <>
      <Button
        display={{ base: "none", lg: "flex" }}
        size="sm"
        leftIcon={icon}
        onClick={handleClick}
        isLoading={loading}
        {...props}
      >
        {label}
      </Button>
      <IconButton
        display={{ base: "flex", lg: "none" }}
        aria-label={label}
        size="lg"
        icon={icon}
        onClick={handleClick}
        isLoading={loading}
        {...props}
      />
      <ErrorAlert error={error} setError={setError} />
    </>
  );
};

type MarkColorIconButtonProps = {
  status: SubmissionStatus;
  onSetStatus: (status: SubmissionStatus) => Promise<void> | void;
}

const MarkColorIconButton = ({ status, onSetStatus }: MarkColorIconButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const handleClick = async () => {
    try {
      setLoading(true);
      await delay(300);
      await onSetStatus(status);
    } catch (e) {
      setError(e as Error);
    }
    setLoading(false);
  };

  return (
    <>
      <IconButton
        colorScheme={FLAG_COLORS[status]}
        aria-label="Orange"
        size="lg"
        icon={<HiFlag />}
        isLoading={loading}
        onClick={handleClick}
      />
      <ErrorAlert error={error} setError={setError} />
    </>
  );
}

type SubmissionHeaderProps = {
  submission: SerializableSubmission;
  onSetStatus: (status: SubmissionStatus) => Promise<void> | void;
  canFlag?: boolean;
  fullAccess?: boolean;
  accountDeleted: boolean;
};

const SubmissionHeader = ({ submission, onSetStatus, canFlag, fullAccess, accountDeleted }: SubmissionHeaderProps) => {
  const [name, discrim] = submission.user_tag.split("#", 2);

  return (
    <Stack spacing={2}>
      <HStack spacing={2}>
        <Stack
          flex="1"
          spacing={{ base: 0, lg: 2 }}
          direction={{ base: "column", lg: "row" }}
          alignItems={{ base: "flex-start", lg: "center" }}
        >
          <Heading size="md">
            {name}
            {hasLegacyDiscriminator(discrim) && (
              <chakra.span color="gray.500" fontWeight="medium">
                #{discrim}
              </chakra.span>
            )}
          </Heading>

          <Text fontSize="sm" color="gray.500">
            {submission.user_id}
          </Text>
        </Stack>

        {(fullAccess || canFlag) && (
          <LightMode>
            {fullAccess && (
              <HeaderButton
                colorScheme="green"
                isDisabled={submission.status === SubmissionStatus.ACCEPTED}
                icon={<HiCheck />}
                label="Accept"
                onClick={() => onSetStatus(SubmissionStatus.ACCEPTED)}
              />
            )}
            <Popover>
              <PopoverTrigger>
                <div>
                  <HeaderButton
                    colorScheme={FLAG_COLORS[submission.status ?? SubmissionStatus.UNDER_REVIEW]}
                    icon={<HiFlag />}
                    label="Mark for Review"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverBody>
                  <HStack>
                    <MarkColorIconButton status={SubmissionStatus.MARKED_ORANGE} onSetStatus={onSetStatus} />
                    <MarkColorIconButton status={SubmissionStatus.MARKED_YELLOW} onSetStatus={onSetStatus} />
                    <MarkColorIconButton status={SubmissionStatus.MARKED_BLUE} onSetStatus={onSetStatus} />
                    <MarkColorIconButton status={SubmissionStatus.MARKED_PURPLE} onSetStatus={onSetStatus} />
                    <MarkColorIconButton status={SubmissionStatus.MARKED_RED} onSetStatus={onSetStatus} />
                  </HStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            {fullAccess && (
              <HeaderButton
                colorScheme="red"
                isDisabled={submission.status === SubmissionStatus.REJECTED}
                icon={<HiX />}
                label="Reject"
                onClick={() => onSetStatus(SubmissionStatus.REJECTED)}
              />
            )}
          </LightMode>
        )}
      </HStack>

      {accountDeleted && (
        <Tag alignSelf="flex-start" colorScheme="red">
          Account deleted
        </Tag>
      )}

      {submission.comment && (
        <Alert
          mt="1"
          status={submission.status === SubmissionStatus.ACCEPTED ? "success" : submission.status === SubmissionStatus.REJECTED ? "error" : "info"}
          variant="left-accent"
          rounded="md"
          py="3"
        >
          <AlertIcon />
          <AlertDescription fontSize="sm" fontWeight="medium">
            {submission.comment}
          </AlertDescription>
        </Alert>
      )}
    </Stack>
  );
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

type PreviousSubmissionCardProps = {
  submission: SerializableSubmission;
  formSlug: string;
};

const PreviousSubmissionCard = ({ submission, formSlug }: PreviousSubmissionCardProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");
  const status = submission.status ?? SubmissionStatus.UNDER_REVIEW;

  return (
    <Link href={`/a/${formSlug}/submissions/${submission._id}`} passHref legacyBehavior>
      <HStack
        as="a"
        shadow={shadow}
        bg={bg}
        rounded="md"
        px="4"
        py="3"
        spacing="4"
        _hover={{ shadow: "lg" }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Text fontWeight="bold" flex="1">
          {getDateFromObjectId(submission._id)}
        </Text>
        <Tag size="sm" colorScheme={STATUS_COLORS[status]}>
          {STATUS_LABELS[status]}
        </Tag>
        {submission.comment && (
          <Text fontSize="sm" color="gray.500" noOfLines={1} maxW="300px">
            {submission.comment}
          </Text>
        )}
      </HStack>
    </Link>
  );
};

type CommentModalProps = {
  isOpen: boolean;
  isNote: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
};

const CommentModal = ({ isOpen, isNote, onClose, onSubmit }: CommentModalProps) => {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const kind = isNote ? "Note" : "Comment";

  useEffect(() => {
    if (isOpen) setComment("");
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(comment);
    } catch (e) {
      setError(e as Error);
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add {kind}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="comment" onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>{kind}</FormLabel>
              <Textarea
                name="comment"
                placeholder={`Enter ${kind.toLowerCase()}...`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                height="200px"
              />
              <FormHelperText>
                {isNote
                  ? "Only staff can see notes. Leave it blank to flag without a note."
                  : "This comment will be sent to the submitter."}
              </FormHelperText>
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} isLoading={isLoading}>
            Cancel
          </Button>
          <Button form="comment" type="submit" colorScheme="blue" mr={3} isLoading={isLoading}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
      <ErrorAlert error={error} setError={setError} />
    </Modal>
  );
};

type SubmissionPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
  submission: SerializableSubmission;
  notes: SerializableSubmissionNote[];
  userSubmissions: SerializableSubmission[];
  fullAccess: boolean;
  fullContent: boolean;
  submittedPunishment: Punishment | null;
  livePunishment: Punishment | null;
  accountDeleted: boolean;
};

const SubmissionPage = ({ user, form, submissions, submission, notes, userSubmissions, fullAccess, fullContent, submittedPunishment, livePunishment, accountDeleted }: SubmissionPageProps) => {
  const [subs, setSubs] = useState(submissions);
  const [sub, setSub] = useState(submission);
  const [subNotes, setSubNotes] = useState(notes);
  const [statusWithComment, setStatusWithComment] = useState<SubmissionStatus | undefined>();

  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  useEffect(() => setSubs(submissions), [submissions]);
  useEffect(() => setSub(submission), [submission]);
  useEffect(() => setSubNotes(notes), [notes]);

  const updateStatus = async (status: SubmissionStatus, text?: string) => {
    const isNote = isFlagStatus(status);
    const comment = isNote ? undefined : text;
    const resp = await fetch(`/api/forms/${form.slug}/submissions/${submission._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment, note: isNote ? text : undefined }),
    });
    if (!resp.ok) throw new Error(await resp.text());

    const { note }: { note: SerializableSubmissionNote | null } = await resp.json();
    if (note) setSubNotes((prev) => [...prev, note]);

    const listSub = submissions.find((x) => x._id === sub._id);
    if (listSub) listSub.status = status;
    setSub({ ...sub, status, comment: comment || sub.comment });
    setSubs(submissions);
  };

  const handleSetStatus = async (status: SubmissionStatus) => {
    if (
      status === SubmissionStatus.ACCEPTED ||
      status === SubmissionStatus.REJECTED ||
      isFlagStatus(status)
    ) {
      setStatusWithComment(status);
    } else {
      await updateStatus(status);
    }
  };

  const handleSubmit = async (comment: string) => {
    if (!statusWithComment) return;
    await updateStatus(statusWithComment, comment);
    setStatusWithComment(undefined);
  };

  return (
    <SubmissionsLayout
      user={user}
      form={form}
      submissions={subs}
      submission={submission}
      contentContainerProps={{ p: 0 }}
    >
      <Flex direction="column" h="full" overflow="hidden">
        <Box px="6" py="4" shadow={shadow} bg={bg} zIndex={1}>
          <SubmissionHeader submission={sub} onSetStatus={handleSetStatus} canFlag={!fullAccess} fullAccess={fullAccess} accountDeleted={accountDeleted} />
        </Box>
        <Box flex="1" overflow="auto" p="6" zIndex={0}>
          {isAppealForm(form.slug) && (
            <Box mb="4">
              <PunishmentCard formId={form.slug} submitted={submittedPunishment} live={livePunishment} />
            </Box>
          )}
          {subNotes.length > 0 && (
            <Box mb="4">
              <SubmissionNotes notes={subNotes} />
            </Box>
          )}
          <SubmissionContent key={form.id} form={form} submission={sub} hideFirstPage={!fullContent} />

          {userSubmissions.length > 0 && (
            <Stack spacing="2" mt="6">
              <Heading size="sm" color="gray.500">
                Other Submissions by This User
              </Heading>
              {userSubmissions.map((s) => (
                <PreviousSubmissionCard key={s._id} submission={s} formSlug={form.slug} />
              ))}
            </Stack>
          )}
        </Box>
      </Flex>
      <CommentModal
        isOpen={statusWithComment !== undefined}
        isNote={statusWithComment !== undefined && isFlagStatus(statusWithComment)}
        onClose={() => setStatusWithComment(undefined)}
        onSubmit={handleSubmit}
      />
    </SubmissionsLayout>
  );
};

export default SubmissionPage;

type SubmissionPageQuery = {
  formId: string;
  submissionId: string;
};

export const getServerSideProps = withServerSideSession<SubmissionPageProps, SubmissionPageQuery>(
  async ({ req, params, query }) => {
    if (!params) throw new Error("No params found.");
    const { formId, submissionId } = params;

    const user = req.session.user;
    const member = req.session.member;
    if (!user || !member) throw new Error("User not found");
    if (!isEnabledForm(formId)) return { notFound: true };

    if (!permittedToViewForm(member, formId)) {
      return { redirect: { permanent: false, destination: "/dashboard" } };
    }

    let form;
    try {
      form = await formium.getFormBySlug(formId);
    } catch (e) {
      const err = e as any;
      if (err.status === 404) return { notFound: true };
    }

    if (!form) return { notFound: true };

    const _submissions = await fetchSubmissions(form.slug, {
      hasVideoEvidence:
        supportsVideoEvidence(form.slug) && query.hasVideoEvidence === "true",
      page: Number(query.page ?? 1),
      userId: query.userId?.toString(),
      status: query.status ? Number(query.status) : { $nin: [1, 2] },
    });
    const submissions = await _submissions.toArray();
    const submission = await fetchSubmission(submissionId);

    if (!submission) return { notFound: true };

    // Fetch other submissions by same user for this form (excluding current)
    const _userSubmissions = await fetchUserFormSubmissions(form.slug, submission.user_id.toString());
    const userSubmissions = (await _userSubmissions.toArray())
      .filter((s) => s._id.toString() !== submissionId)
      .map(makeSerializable);

    const fullAccess = hasFullAccess(member, formId);
    const fullContent = hasFullContentAccess(member, formId);
    const serializedSubmission = makeSerializable(submission);

    const userId = serializedSubmission.user_id;
    const [livePunishment, accountDeleted] = await Promise.all([
      isAppealForm(formId) ? fetchPunishment(formId, userId).catch(() => null) : null,
      fetchAccountDeleted(userId).catch(() => false),
    ]);

    if (!fullContent) {
      const firstPageSlugs = getFirstPageFieldSlugs(form);
      const filteredData = Object.fromEntries(
        Object.entries(serializedSubmission.data).filter(
          ([key]) => !firstPageSlugs.has(key)
        )
      );
      serializedSubmission.data = filteredData;
    }

    return {
      props: {
        id: formId,
        form,
        user,
        submissions: submissions.map(makeSerializable),
        submission: serializedSubmission,
        notes: (submission.notes ?? []).map(makeSerializableNote),
        userSubmissions,
        fullAccess,
        fullContent,
        submittedPunishment: submission.punishment ?? null,
        livePunishment,
        accountDeleted,
      },
    };
  },
  AuthMode.AUTHENTICATED
);
