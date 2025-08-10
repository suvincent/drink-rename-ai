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
        <footer className="p-6">
          <div className="container mx-auto flex justify-center items-center gap-8">
            <a href="https://github.com/suvincent/drink-rename-ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <i className="pi pi-github"></i>
              <span>GitHub</span>
            </a>
            <a href="https://forms.gle/KRD4JjEkei6JzXJj7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg hover:text-green-500 dark:hover:text-green-400 transition-colors">
              <i className="pi pi-google"></i>
              <span>Feedback</span>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
