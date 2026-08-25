import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  AspectRatio,
  Box,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";

import { getYouTubeEmbedUrl } from "~helpers/videoEvidence";

type VideoEvidenceItemProps = {
  link: string;
  index: number;
};

const VideoEvidenceItem = ({ link, index }: VideoEvidenceItemProps) => {
  const [failed, setFailed] = useState(false);
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const youtubeEmbedUrl = getYouTubeEmbedUrl(link);

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="md" overflow="hidden">
      <AspectRatio ratio={16 / 9}>
        {failed ? (
          <Stack align="center" justify="center" p="4" bg="blackAlpha.50">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              This video could not be played. The link may have expired or may not point directly
              to a supported video file.
            </Text>
          </Stack>
        ) : youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            title={`Video evidence ${index + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <Box w="full" h="full" bg="black">
            <video
              src={link}
              aria-label={`Video evidence ${index + 1}`}
              controls
              preload="metadata"
              onError={() => setFailed(true)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
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
        Open video <ExternalLinkIcon mx="1px" />
      </Link>
    </Box>
  );
};

type VideoEvidenceProps = {
  links: string[];
};

const VideoEvidence = ({ links }: VideoEvidenceProps) => (
  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3" w="full">
    {links.map((link, index) => (
      <VideoEvidenceItem key={link} link={link} index={index} />
    ))}
  </SimpleGrid>
);

export default VideoEvidence;
