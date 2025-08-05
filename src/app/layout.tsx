import type { Metadata } from "next";
import "./globals.css";
import MUIThemeProvider from "@/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "NEXUS - Learning Management System",
  description: "A comprehensive LMS for schools with role-based access and advanced assessment tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MUIThemeProvider>
          {children}
        </MUIThemeProvider>
      </body>
    </html>
  );
}
