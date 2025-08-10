import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConfirmPopup } from 'primereact/confirmpopup'; // Import ConfirmPopup

// PrimeReact CSS
import "primereact/resources/themes/saga-blue/theme.css"; // or any other theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drink Name Simplifier",
  description: "An app to simplify drink names",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <ConfirmPopup /> {/* Add ConfirmPopup here */}
      </body>
    </html>
  );
}
