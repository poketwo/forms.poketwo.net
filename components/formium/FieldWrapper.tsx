import { Box, useColorModeValue } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const FieldWrapper = ({ children }: PropsWithChildren<{}>) => {
  const shadow = useColorModeValue("base", "lg");
  return (
    <Box rounded="md" shadow={shadow} p="4">
      {children}
    </Box>
  );
};

export default FieldWrapper;
