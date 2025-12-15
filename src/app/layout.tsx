import "@/styles/globals.css";

import { Inter } from "next/font/google"; // Use Inter or any Google font
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import StyledComponentsRegistry from "./antd-registry";
import { ConfigProvider } from "antd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Quotation App",
  description: "Request and manage quotations",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

import MainLayout from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <StyledComponentsRegistry>
           <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
              <TRPCReactProvider>
                <MainLayout>
                    {children}
                </MainLayout>
              </TRPCReactProvider>
           </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
