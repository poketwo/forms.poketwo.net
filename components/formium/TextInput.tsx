import { Input } from "@chakra-ui/react";
import { TextInputProps } from "@formium/react/dist/inputs";

const TextInput = ({
  disabled,
  id,
  name,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  required,
  type,
  value,
}: TextInputProps) => (
  <Input
    id={id}
    name={name}
    type={type}
    value={value}
    placeholder={placeholder ?? "Enter answer..."}
    isDisabled={disabled}
    isRequired={required}
    onBlur={onBlur}
    onChange={onChange}
    onFocus={onFocus}
    maxLength={100}
  />
);

export default TextInput;
