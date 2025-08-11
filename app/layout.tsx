import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import {ClerkProvider} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElevU",
  description: "Real-time AI Teaching Platform",
  icons:{
    icon: "/images/logo.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ variables:{ colorPrimary : '#fe5933'  }}}>
      <html lang="en">
        <body className="antialiased">
          <Navbar/>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}