import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const FieldWrapper = ({ children }: PropsWithChildren<{}>) => (
  <Box rounded="md" shadow="base" p="4">
    {children}
  </Box>
);

export default FieldWrapper;
