import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { AppProps } from "next/app";
import Head from "next/head";
import NextNprogress from "nextjs-progressbar";

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
  initialColorMode: "dark",
  useSystemColorMode: false,
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode("white", "gray.900")(props),
      },
    }),
  },
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>Pokétwo Forms Site</title>
    </Head>

    {/* @ts-ignore */}
    <NextNprogress
      color="#29D"
      startPosition={0.3}
      stopDelayMs={200}
      height={3}
      showOnShallow={true}
    />

    <ChakraProvider theme={theme}>
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </ChakraProvider>
  </>
);

export default MyApp;
