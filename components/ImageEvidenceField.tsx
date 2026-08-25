import {
  AddIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
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

import {
  MAX_IMAGE_EVIDENCE_LINKS,
  isValidImageEvidenceUrl,
} from "~helpers/imageEvidence";

type ImageEvidenceFieldProps = {
  links: string[];
  onChange: (links: string[]) => void;
};

const ImageEvidenceField = ({ links, onChange }: ImageEvidenceFieldProps) => {
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
          <FormLabel mb="1">Image evidence (optional)</FormLabel>
          <Text color="gray.500" fontSize="sm">
            While optional, image evidence is effectively required for the fastest resolution.
          </Text>
        </Box>

        <Alert status="warning" rounded="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Add Discord attachment, Imgur, or other direct image links. Discord attachment links
            expire, so use a permanent image host when possible.
          </AlertDescription>
        </Alert>

        <Stack spacing="3">
          {links.map((link, index) => {
            const isInvalid = link.trim().length > 0 && !isValidImageEvidenceUrl(link.trim());

            return (
              <FormControl key={index} isInvalid={isInvalid}>
                <HStack align="flex-start">
                  <Input
                    aria-label={`Image evidence link ${index + 1}`}
                    type="url"
                    placeholder="https://..."
                    value={link}
                    onChange={(event) => updateLink(index, event.target.value)}
                  />
                  <IconButton
                    aria-label={`Remove image evidence link ${index + 1}`}
                    icon={<DeleteIcon />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeLink(index)}
                  />
                </HStack>
                <FormErrorMessage>Enter a valid HTTPS image link.</FormErrorMessage>
              </FormControl>
            );
          })}
        </Stack>

        <Button
          alignSelf="flex-start"
          size="sm"
          variant="outline"
          leftIcon={<AddIcon />}
          isDisabled={links.length >= MAX_IMAGE_EVIDENCE_LINKS}
          onClick={() => onChange([...links, ""])}
        >
          Add another image
        </Button>
      </Stack>
    </Box>
  );
};

export default ImageEvidenceField;
