import { Button } from "@chakra-ui/react";

const SubmitButton = ({ disabled, ...props }: JSX.IntrinsicElements["button"]) => (
  <Button colorScheme="blue" isLoading={disabled} {...props} />
);

export default SubmitButton;
