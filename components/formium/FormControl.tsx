import {
  FormControl as ChakraFormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/react";
import { FormControlProps } from "@formium/react";

const FormControl = ({
  children,
  description,
  disabled,
  error,
  label,
  required,
}: FormControlProps) => (
  <ChakraFormControl isDisabled={disabled} isRequired={required} isInvalid={!!error}>
    <FormLabel>{label}</FormLabel>
    {children}
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
    {description && <FormHelperText>{description}</FormHelperText>}
  </ChakraFormControl>
);

export default FormControl;
