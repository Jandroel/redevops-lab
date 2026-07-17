import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  applicationName: "ReDevOps Lab",
  title: {
    default: "ReDevOps Lab",
    template: "%s | ReDevOps Lab"
  },
  description: "Turn any GitHub repository into a DevOps learning lab.",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
