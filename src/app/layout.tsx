// src/app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookMe",
  description: "Book services, manage bookings, all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
