import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useRef } from "react";

type ErrorAlertProps = {
  error: Error | undefined;
  setError: Dispatch<SetStateAction<Error | undefined>>;
};

const ErrorAlert = ({ error, setError }: ErrorAlertProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      leastDestructiveRef={ref}
      onClose={() => setError(undefined)}
      isOpen={!!error}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Error</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>{error?.message}</AlertDialogBody>
        <AlertDialogFooter>
          <Button colorScheme="red" ref={ref} onClick={() => setError(undefined)}>
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorAlert;
