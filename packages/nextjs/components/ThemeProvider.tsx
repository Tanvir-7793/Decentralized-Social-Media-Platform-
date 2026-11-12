"use client";

import * as React from "react";

export const ThemeProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Record<string, unknown>>) => {
  return <>{children}</>;
};
