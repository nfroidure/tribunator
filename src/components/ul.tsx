import type { HTMLAttributes } from "react";

const UnorderedList = ({
  children,
  ...props
}: { children: React.ReactNode } & HTMLAttributes<HTMLUListElement>) => (
  <ul className="root" {...props}>
    {children}
    <style jsx>{`
      .root {
        margin: 0 0 var(--vRythm) 0;
      }
    `}</style>
  </ul>
);

export default UnorderedList;
