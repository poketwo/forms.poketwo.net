import { Textarea as ChakraTextarea } from "@chakra-ui/react";
import { TextareaProps } from "@formium/react/dist/inputs";

const TextInput = ({
  disabled,
  id,
  name,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  required,
  rows,
  value,
}: TextareaProps) => (
  <ChakraTextarea
    id={id}
    name={name}
    rows={rows}
    value={value}
    placeholder={placeholder}
    isDisabled={disabled}
    isRequired={required}
    onBlur={onBlur}
    onChange={onChange}
    onFocus={onFocus}
  />
);

export default TextInput;
