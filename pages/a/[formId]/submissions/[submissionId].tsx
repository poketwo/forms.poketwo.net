import {
  Box,
  Button,
  ButtonProps,
  Code,
  Divider,
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
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  Textarea,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form } from "@formium/types";
import { FormEvent, ReactElement, useEffect, useState } from "react";
import { HiCheck, HiFlag, HiX } from "react-icons/hi";

import ErrorAlert from "~components/formium/ErrorAlert";
import SubmissionsLayout from "~components/layouts/SubmissionsLayout";
import { fetchSubmission, fetchSubmissions } from "~helpers/db";
import { formium } from "~helpers/formium";
import { permittedToViewForm } from "~helpers/permissions";
import { AuthMode, withServerSideSession } from "~helpers/session";
import {
  Position,
  SerializableSubmission,
  SubmissionStatus,
  User,
  makeSerializable,
} from "~helpers/types";
import { delay } from "~helpers/utils";

const COLORS = {
  [SubmissionStatus.UNDER_REVIEW]: "gray",
  [SubmissionStatus.ACCEPTED]: "gray",
  [SubmissionStatus.REJECTED]: "gray",
  [SubmissionStatus.MARKED_ORANGE]: "orange",
  [SubmissionStatus.MARKED_YELLOW]: "yellow",
  [SubmissionStatus.MARKED_BLUE]: "blue",
  [SubmissionStatus.MARKED_PURPLE]: "purple",
}

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
        colorScheme={COLORS[status]}
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
};

const SubmissionHeader = ({ submission, onSetStatus }: SubmissionHeaderProps) => {
  const [name, discrim] = submission.user_tag.split("#", 2);

  return (
    <HStack spacing={2}>
      <Stack
        flex="1"
        spacing={{ base: 0, lg: 2 }}
        direction={{ base: "column", lg: "row" }}
        alignItems={{ base: "flex-start", lg: "center" }}
      >
        <Heading size="md">
          {name}
          <chakra.span color="gray.500" fontWeight="medium">
            #{discrim}
          </chakra.span>
        </Heading>

        <Text fontSize="sm" color="gray.500">
          {submission.user_id}
        </Text>
      </Stack>

      <LightMode>
        <HeaderButton
          colorScheme="green"
          isDisabled={submission.status === SubmissionStatus.ACCEPTED}
          icon={<HiCheck />}
          label="Accept"
          onClick={() => onSetStatus(SubmissionStatus.ACCEPTED)}
        />
        <Popover>
          <PopoverTrigger>
            <div>
              <HeaderButton
                colorScheme={COLORS[submission.status ?? SubmissionStatus.UNDER_REVIEW]}
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
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <HeaderButton
          colorScheme="red"
          isDisabled={submission.status === SubmissionStatus.REJECTED}
          icon={<HiX />}
          label="Reject"
          onClick={() => onSetStatus(SubmissionStatus.REJECTED)}
        />
      </LightMode>
    </HStack>
  );
};

type SubmissionContentProps = {
  form: Form;
  submission: SerializableSubmission;
};

const SubmissionContent = ({ form, submission }: SubmissionContentProps) => {
  const fieldNames = Object.values(form.schema?.fields ?? {}).reduce(
    (acc, val) => acc.set(val.slug, val.title),
    new Map<string, string | undefined>()
  );

  const ownedFields = [...fieldNames.keys()].filter((x) => submission.data.hasOwnProperty(x));
  const otherFields = Object.keys(submission.data).filter((x) => !ownedFields.includes(x));
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  return (
    <Stack spacing="4">
      {ownedFields.map((x) => (
        <Stack key={x} shadow={shadow} bg={bg} rounded="md" p="4" alignItems="flex-start">
          <Text
            fontWeight="bold"
            _after={{
              content: `"${x}"`,
              ml: 2,
              color: "gray.500",
              fontWeight: "normal",
              fontSize: "sm",
            }}
          >
            {fieldNames.get(x)}
          </Text>

          <Text>{submission.data[x]}</Text>
        </Stack>
      ))}

      {otherFields.length > 0 && <Divider />}

      {otherFields.map((x) => (
        <Stack key={x} alignItems="flex-start">
          <Code fontWeight="bold">{x}</Code>
          <Text>{submission.data[x]}</Text>
        </Stack>
      ))}
    </Stack>
  );
};

type CommentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
};

const CommentModal = ({ isOpen, onClose, onSubmit }: CommentModalProps) => {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit(comment);
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Comment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="comment" onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Comment</FormLabel>
              <Textarea
                name="comment"
                placeholder="Enter comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                height="200px"
              />
              <FormHelperText>This comment will be sent to the submitter.</FormHelperText>
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
    </Modal>
  );
};

type SubmissionPageProps = {
  user: User;
  form: Form;
  submissions: SerializableSubmission[];
  submission: SerializableSubmission;
};

const SubmissionPage = ({ user, form, submissions, submission }: SubmissionPageProps) => {
  const [subs, setSubs] = useState(submissions);
  const [sub, setSub] = useState(submission);
  const [statusWithComment, setStatusWithComment] = useState<SubmissionStatus | undefined>();

  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  useEffect(() => setSubs(submissions), [submissions]);
  useEffect(() => setSub(submission), [submission]);

  const updateStatus = async (status: SubmissionStatus, comment?: string) => {
    const resp = await fetch(`/api/forms/${form.slug}/submissions/${submission._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment }),
    });
    if (!resp.ok) throw new Error(await resp.text());

    const listSub = submissions.find((x) => x._id === sub._id);
    if (listSub) listSub.status = status;
    setSub({ ...sub, status });
    setSubs(submissions);
  };

  const handleSetStatus = async (status: SubmissionStatus) => {
    if (status === SubmissionStatus.ACCEPTED || status === SubmissionStatus.REJECTED) {
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
          <SubmissionHeader submission={sub} onSetStatus={handleSetStatus} />
        </Box>
        <Box flex="1" overflow="auto" p="6" zIndex={0}>
          <SubmissionContent key={form.id} form={form} submission={sub} />
        </Box>
      </Flex>
      <CommentModal
        isOpen={statusWithComment !== undefined}
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
      page: Number(query.page ?? 1),
      userId: query.userId?.toString(),
      status: query.status ? Number(query.status) : { $nin: [1, 2] },
    });
    const submissions = await _submissions.toArray();
    const submission = await fetchSubmission(submissionId);

    if (!submission) return { notFound: true };

    return {
      props: {
        id: formId,
        form,
        user,
        submissions: submissions.map(makeSerializable),
        submission: makeSerializable(submission),
      },
    };
  },
  AuthMode.AUTHENTICATED,
  Position.COMMUNITY_MANAGER
);
