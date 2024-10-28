import { Alert, AlertIcon, Box, Button, Heading, VStack } from "@chakra-ui/react";
import Image from "next/image";

import WrappedLink from "~components/WrappedLink";
import { AuthMode, withServerSideSession } from "~helpers/session";

type HomeProps = {
  error: string | null;
};

const Home = ({ error }: HomeProps) => {
  return (
    <VStack spacing="6" py="12">
      {error && (
        <Alert maxW="md" status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <VStack spacing="0">
        <Box>
          <img
            width="80"
            height="80"
            src="https://poketwo.net/assets/logo.png"
            alt="Pokétwo Logo"
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

export const getServerSideProps = withServerSideSession<HomeProps>(async ({ req }) => {
  const error = req.session.error ?? null;

  if (!error) {
    req.session.error = undefined;
    await req.session.save();
    return { props: { error } };
  }

  return { props: { error: "" } };
}, AuthMode.GUEST);
