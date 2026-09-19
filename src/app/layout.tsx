import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "VocaCommerce",
  description: "Accessible B2B commerce for everyone. Create a store. Shop by voice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans`}>
        {children}
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "border border-border bg-white text-foreground shadow-sm font-sans",
              title: "text-sm font-medium text-foreground",
              description: "text-sm text-muted-foreground",
              success: "border-border bg-white text-foreground",
              error: "border-border bg-white text-foreground",
              actionButton: "bg-primary text-primary-foreground",
              closeButton: "border-border bg-white text-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
