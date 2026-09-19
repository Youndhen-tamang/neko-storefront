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
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon_io/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon_io/site.webmanifest",
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
