import { HStack } from "@chakra-ui/layout";
import { PropsWithChildren } from "react";

const FooterWrapper = ({ children }: PropsWithChildren<{}>) => (
  <HStack spacing="2">{children}</HStack>
);

export default FooterWrapper;
