import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppSidebar } from "@/components/AppSidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Productivity App",
  description: "Your personalized productivity dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="flex h-screen w-full">
            <div className="hidden md:block">
              <AppSidebar />
            </div>
            <main className="flex-1 overflow-hidden">{children}</main>
            <MobileTabBar />
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
