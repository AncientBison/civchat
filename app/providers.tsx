"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { WebSocketProvider } from "next-ws/client";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  React.useEffect(() => {
    window.onbeforeunload = () => {
      sessionStorage.clear();
    };
  }, []);

  return (
    <WebSocketProvider url="api">
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <React.Suspense>{children}</React.Suspense>
        </NextThemesProvider>
      </NextUIProvider>
    </WebSocketProvider>
  );
}
