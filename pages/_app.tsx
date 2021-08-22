import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AppProps } from "next/app";
import Head from "next/head";

const theme = extendTheme({
  colors: {
    blurple: {
      50: "#f7f7fe",
      100: "#eef0fe",
      200: "#d5d9fc",
      300: "#bcc1fa",
      400: "#8a93f6",
      500: "#5865f2",
      600: "#4f5bda",
      700: "#424cb6",
      800: "#353d91",
      900: "#2b3177",
    },
  },
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>Pokétwo Applications Site</title>
    </Head>

    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  </>
);

export default MyApp;
