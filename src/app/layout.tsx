import { getUser } from "@//actions/user";
import "@/app/globals.css";
import { UserProvider } from "@/lib/auth";
import { TRPCReactProvider } from "@/trpc/react";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

export const metadata: Metadata = {
  title: "ScaleSage | AI-Powered PnL",
  description: "ScaleSage is a platform for AI-powered PnL analysis and optimization.",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let userPromise = getUser();

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white  ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <TRPCReactProvider>
          <UserProvider userPromise={userPromise}>{children}</UserProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
