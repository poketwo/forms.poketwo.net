import { Textarea as ChakraTextarea } from "@chakra-ui/react";
import { TextareaProps } from "@formium/react/dist/inputs";
import TextareaAutosize from "react-textarea-autosize";

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
    placeholder={placeholder ?? "Enter response..."}
    isDisabled={disabled}
    isRequired={required}
    onBlur={onBlur}
    onChange={onChange}
    onFocus={onFocus}
    as={TextareaAutosize}
    resize="none"
    overflow="hidden"
  />
);

export default TextInput;
