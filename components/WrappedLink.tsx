import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

type WrappedLinkProps = PropsWithChildren<LinkProps> & {
  className?: string;
};

const WrappedLink = ({ className, children, ...props }: WrappedLinkProps) => (
  <Link {...props}>
    <a className={className}>{children}</a>
  </Link>
);

export default WrappedLink;
