import { Heading } from "@chakra-ui/react";
import { Form } from "@formium/types";
import { PropsWithChildren } from "react";

type HeaderProps = PropsWithChildren<{
  form: Form;
  page: any;
}>;

const Header = ({ page }: HeaderProps) => <Heading>{page.title}</Heading>;

export default Header;
