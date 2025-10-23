import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audio Chat Demo",
  description: "Audio transcription and chat application using Azure OpenAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
