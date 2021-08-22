import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  VStack,
} from "@chakra-ui/react";
import WrappedLink from "components/WrappedLink";
import Image from "next/image";

const Home = ({ error }) => {
  error = "Test";
  return (
    <VStack spacing={6} py={12}>
      {error && (
        <Alert maxW="md" status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <VStack spacing={0}>
        <Box>
          <Image
            width={80}
            height={80}
            src="https://poketwo.net/assets/logo.png"
          />
        </Box>
        <Heading>Sign in</Heading>
      </VStack>

      <Button as={WrappedLink} href="/api/login" colorScheme="blurple">
        Sign in with Discord
      </Button>
    </VStack>
  );
};

export default Home;
