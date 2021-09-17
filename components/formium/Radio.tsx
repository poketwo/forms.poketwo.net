import { Radio as ChakraRadio } from "@chakra-ui/react";
import { RadioProps } from "@formium/react/dist/inputs";

const Radio = ({ checked, disabled, id, label, name, onBlur, onChange, value }: RadioProps) => (
  <ChakraRadio
    id={id}
    name={name}
    isChecked={checked}
    isDisabled={disabled}
    value={value}
    onBlur={onBlur}
    onChange={onChange}
  >
    {label}
  </ChakraRadio>
);

export default Radio;
