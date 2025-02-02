import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Suspense} from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WikiRace - Race through Wikipedia!",
  description: "Race from one Wikipedia article to another using only hyperlinks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 to-indigo-50`}>
        <main className="min-h-screen p-4">
            <Suspense fallback={<div>Loading...</div>}>
          {children}
            </Suspense>
        </main>
      </body>
    </html>
  );
}
