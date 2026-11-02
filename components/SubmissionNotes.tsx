import { Box, HStack, Heading, Icon, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { HiFlag } from "react-icons/hi";

import { FLAG_COLORS, SerializableSubmissionNote } from "~helpers/types";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

type SubmissionNotesProps = {
  notes: SerializableSubmissionNote[];
};

const SubmissionNotes = ({ notes }: SubmissionNotesProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");

  return (
    <Box shadow={shadow} bg={bg} rounded="md" px="4" py="3">
      <Heading size="sm" color="gray.500" mb="2">
        Staff Notes
      </Heading>
      <Stack spacing="3">
        {notes.map((note, i) => (
          <Stack key={i} spacing="1">
            <HStack spacing="2" fontSize="sm">
              <Icon as={HiFlag} color={`${FLAG_COLORS[note.status]}.500`} />
              <Text fontWeight="bold">{note.author_tag}</Text>
              <Text color="gray.500">{DATE_FORMAT.format(new Date(note.created_at))} UTC</Text>
            </HStack>
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {note.text}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default SubmissionNotes;
