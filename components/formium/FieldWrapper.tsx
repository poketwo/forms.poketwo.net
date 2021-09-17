import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const FieldWrapper = ({ children }: PropsWithChildren<{}>) => (
  <Box rounded="md" borderWidth={1} p="4">
    {children}
  </Box>
);

export default FieldWrapper;
