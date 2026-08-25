import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import { MAX_VIDEO_EVIDENCE_LINKS, isValidVideoEvidenceUrl } from "~helpers/videoEvidence";

type VideoEvidenceFieldProps = {
  links: string[];
  onChange: (links: string[]) => void;
};

const VideoEvidenceField = ({ links, onChange }: VideoEvidenceFieldProps) => {
  const shadow = useColorModeValue("base", "lg");

  const updateLink = (index: number, value: string) => {
    onChange(links.map((link, linkIndex) => (linkIndex === index ? value : link)));
  };

  const removeLink = (index: number) => {
    const nextLinks = links.filter((_, linkIndex) => linkIndex !== index);
    onChange(nextLinks.length > 0 ? nextLinks : [""]);
  };

  return (
    <Box rounded="md" shadow={shadow} p="4" mb="4">
      <Stack spacing="4">
        <Box>
          <FormLabel mb="1">Video evidence (optional)</FormLabel>
          <Text color="gray.500" fontSize="sm">
            Video evidence is technically optional, but we generally cannot process an appeal
            without it. Include clear evidence to avoid delays.
          </Text>
        </Box>

        <Alert status="warning" rounded="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Upload your video to YouTube, Imgur, Catbox, or File Garden, then paste a public link
            that anyone can view without signing in. Use a direct video link for hosts other than
            YouTube.
          </AlertDescription>
        </Alert>

        <Stack spacing="3">
          {links.map((link, index) => {
            const isInvalid = link.trim().length > 0 && !isValidVideoEvidenceUrl(link.trim());

            return (
              <FormControl key={index} isInvalid={isInvalid}>
                <HStack align="flex-start">
                  <Input
                    aria-label={`Video evidence link ${index + 1}`}
                    type="url"
                    placeholder="https://youtu.be/..."
                    value={link}
                    onChange={(event) => updateLink(index, event.target.value)}
                  />
                  <IconButton
                    aria-label={`Remove video evidence link ${index + 1}`}
                    icon={<DeleteIcon />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeLink(index)}
                  />
                </HStack>
                <FormErrorMessage>Enter a valid HTTPS video link.</FormErrorMessage>
              </FormControl>
            );
          })}
        </Stack>

        <Button
          alignSelf="flex-start"
          size="sm"
          variant="outline"
          leftIcon={<AddIcon />}
          isDisabled={links.length >= MAX_VIDEO_EVIDENCE_LINKS}
          onClick={() => onChange([...links, ""])}
        >
          Add another video
        </Button>
      </Stack>
    </Box>
  );
};

export default VideoEvidenceField;
