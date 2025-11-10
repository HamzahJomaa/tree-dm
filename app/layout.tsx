import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Shared KPIs",
};
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={<>Loading...</>}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
