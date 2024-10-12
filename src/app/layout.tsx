import type { Metadata } from "next";
import { Gabarito } from 'next/font/google'
import "./globals.css";
import ThemeProvider from "../app/ui/utils/ThemeProvider";

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

export const gabarito = Gabarito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Xiaolei Qin",
  description: "Hi, I am Orion, and let's design the way we enigneer!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={gabarito.className}
      >
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
