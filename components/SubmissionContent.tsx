import { Code, Divider, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Form } from "@formium/types";

import VideoEvidence from "~components/VideoEvidence";
import { getFirstPageFieldSlugs } from "~helpers/form";
import { SerializableSubmission } from "~helpers/types";
import { VIDEO_EVIDENCE_FIELD, normalizeVideoEvidenceLinks } from "~helpers/videoEvidence";

type SubmissionContentProps = {
  form: Form;
  submission: SerializableSubmission;
  hideFirstPage?: boolean;
};

const SubmissionContent = ({
  form,
  submission,
  hideFirstPage,
}: SubmissionContentProps) => {
  const firstPageSlugs = hideFirstPage ? getFirstPageFieldSlugs(form) : new Set<string>();

  const fieldNames = Object.values(form.schema?.fields ?? {}).reduce(
    (acc, val) => acc.set(val.slug, val.title),
    new Map<string, string | undefined>()
  );

  const ownedFields = [...fieldNames.keys()]
    .filter((x) => submission.data.hasOwnProperty(x))
    .filter((x) => !firstPageSlugs.has(x));
  const otherFields = Object.keys(submission.data)
    .filter((x) => !ownedFields.includes(x))
    .filter((x) => !firstPageSlugs.has(x))
    .filter((x) => x !== VIDEO_EVIDENCE_FIELD);
  const videoEvidenceLinks = normalizeVideoEvidenceLinks(
    submission.data[VIDEO_EVIDENCE_FIELD]
  );
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

      {videoEvidenceLinks.length > 0 && (
        <Stack shadow={shadow} bg={bg} rounded="md" p="4" alignItems="flex-start">
          <Text fontWeight="bold">Video evidence</Text>
          <VideoEvidence links={videoEvidenceLinks} />
        </Stack>
      )}

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

export default SubmissionContent;
