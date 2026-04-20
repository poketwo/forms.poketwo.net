import {
  Code,
  Divider,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form } from "@formium/types";

import { SerializableSubmission } from "~helpers/types";

type SubmissionContentProps = {
  form: Form;
  submission: SerializableSubmission;
  hideFirstPage?: boolean;
};

const getFirstPageFieldSlugs = (form: Form): Set<string> => {
  const schema = form.schema;
  if (!schema?.pageIds?.length) return new Set();

  const firstPageId = schema.pageIds[0];
  const firstPage = schema.fields[firstPageId];
  if (!firstPage?.items) return new Set();

  return new Set(
    firstPage.items
      .map((id) => schema.fields[id]?.slug)
      .filter((slug): slug is string => !!slug)
  );
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
    .filter((x) => !firstPageSlugs.has(x));
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

export default SubmissionContent;
