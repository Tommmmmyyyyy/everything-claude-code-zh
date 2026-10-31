import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "filled" | "ghost" | "cream";

interface Common {
  variant?: Variant;
  children: ReactNode;
  icon?: boolean;
  magnetic?: boolean;
  className?: string;
}

function Inner({ children, icon }: { children: ReactNode; icon?: boolean }) {
  return (
    <>
      <span className="btn-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {icon && (
        <span className="btn-icon" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 5h8M5.5 1.5 9 5 5.5 8.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      )}
    </>
  );
}

export function ButtonLink({
  variant = "filled",
  children,
  icon = true,
  magnetic = true,
  className = "",
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} data-magnetic={magnetic ? "0.25" : undefined} className={`btn btn-${variant} ${className}`}>
      <Inner icon={icon}>{children}</Inner>
    </a>
  );
}

export function Button({
  variant = "filled",
  children,
  icon = false,
  magnetic = false,
  className = "",
  type = "button",
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} type={type} data-magnetic={magnetic ? "0.25" : undefined} className={`btn btn-${variant} ${className}`}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}
