import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

const PageShell = ({ children, className = "" }: PageShellProps) => {
  return (
    <main className={`mt-24 md:mt-28 lg:mt-20 ${className}`.trim()}>
      {children}
    </main>
  );
};

export default PageShell;
