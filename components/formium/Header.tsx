import { Heading } from "@chakra-ui/react";
import { Form, FormElement } from "@formium/types";
import { PropsWithChildren } from "react";

import VideoEvidenceSlot from "~components/VideoEvidenceSlot";

type HeaderProps = PropsWithChildren<{
  form: Form;
  page: FormElement;
}>;

const Header = ({ page }: HeaderProps) => (
  <>
    <Heading>{page.title}</Heading>
    <VideoEvidenceSlot />
  </>
);

export default Header;
