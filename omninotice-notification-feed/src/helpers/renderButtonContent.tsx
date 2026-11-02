import type { ComponentType, ReactNode } from "react";

export const renderButtonContent = (
  children: ReactNode,
  LeftIcon?: ComponentType,
  RightIcon?: ComponentType,
) => (
  <>
    {LeftIcon ? (
      <span>
        <LeftIcon />
      </span>
    ) : null}
    {children}
    {RightIcon ? (
      <span>
        <RightIcon />
      </span>
    ) : null}
  </>
);