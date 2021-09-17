import { Stack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const ElementsWrapper = ({ children }: PropsWithChildren<{}>) => (
  <Stack spacing="4">{children}</Stack>
);

export default ElementsWrapper;
