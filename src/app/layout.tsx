import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu Control Panel",
  description: "Menu control panel",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
