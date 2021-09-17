import { Stack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const PageWrapper = ({ children }: PropsWithChildren<{}>) => <Stack spacing="4">{children}</Stack>;

export default PageWrapper;
