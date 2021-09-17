import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";
import { CheckboxProps } from "@formium/react/dist/inputs";

const Checkbox = ({
  checked,
  disabled,
  id,
  label,
  name,
  onBlur,
  onChange,
  value,
}: CheckboxProps) => (
  <ChakraCheckbox
    id={id}
    name={name}
    isChecked={checked}
    isDisabled={disabled}
    value={value}
    onBlur={onBlur}
    onChange={onChange}
  >
    {label}
  </ChakraCheckbox>
);

export default Checkbox;
