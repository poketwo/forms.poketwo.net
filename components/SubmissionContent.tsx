import {
  Box,
  Code,
  Divider,
  HStack,
  Heading,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form } from "@formium/types";

import { SerializableSubmission } from "~helpers/types";

export type PriorRejectionItem = {
  _id: string;
  comment: string | null;
  reviewer_id: string | null;
};

type SubmissionContentProps = {
  form: Form;
  submission: SerializableSubmission;
  priorRejections: PriorRejectionItem[];
  showReviewerIds?: boolean;
};

const SubmissionContent = ({
  form,
  submission,
  priorRejections,
  showReviewerIds = true,
}: SubmissionContentProps) => {
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

      {priorRejections.length > 0 && (
        <>
          <Divider />
          <Heading size="sm">Prior Rejections</Heading>
          {priorRejections.map((r) => (
            <Stack key={r._id} shadow={shadow} bg={bg} rounded="md" p="4" alignItems="flex-start">
              <HStack>
                <Tag colorScheme="red" size="sm">
                  Rejected
                </Tag>
                {showReviewerIds && r.reviewer_id && (
                  <Text fontSize="sm" color="gray.500">
                    by {r.reviewer_id}
                  </Text>
                )}
              </HStack>
              <Text>{r.comment ?? "No comment provided."}</Text>
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
};

export default SubmissionContent;
