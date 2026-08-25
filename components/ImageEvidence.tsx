import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  AspectRatio,
  Box,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";

import { getImageEvidencePreviewUrl } from "~helpers/imageEvidence";

type ImageEvidenceItemProps = {
  link: string;
  index: number;
};

const ImageEvidenceItem = ({ link, index }: ImageEvidenceItemProps) => {
  const [failed, setFailed] = useState(false);
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="md" overflow="hidden">
      <AspectRatio ratio={16 / 9}>
        {failed ? (
          <Stack align="center" justify="center" p="4" bg="blackAlpha.50">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              This image could not be previewed. The link may have expired.
            </Text>
          </Stack>
        ) : (
          <Link
            href={link}
            isExternal
            aria-label={`Open image evidence ${index + 1}`}
            w="full"
            h="full"
          >
            <Image
              src={getImageEvidencePreviewUrl(link)}
              alt={`Image evidence ${index + 1}`}
              w="full"
              h="full"
              objectFit="contain"
              bg="blackAlpha.100"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
            />
          </Link>
        )}
      </AspectRatio>
      <Link
        href={link}
        isExternal
        display="block"
        px="3"
        py="2"
        fontSize="sm"
        color="blue.500"
        noOfLines={1}
      >
        Open image <ExternalLinkIcon mx="1px" />
      </Link>
    </Box>
  );
};

type ImageEvidenceProps = {
  links: string[];
};

const ImageEvidence = ({ links }: ImageEvidenceProps) => (
  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3" w="full">
    {links.map((link, index) => (
      <ImageEvidenceItem key={link} link={link} index={index} />
    ))}
  </SimpleGrid>
);

export default ImageEvidence;
