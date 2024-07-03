import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

type WrappedLinkProps = PropsWithChildren<LinkProps> & {
  className?: string;
};

const WrappedLink = ({ children, ...props }: WrappedLinkProps) => (
  <Link {...props}>{children}</Link>
);

export default WrappedLink;
