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
  title: "Store",
  description: "Multi-tenant ecommerce storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "border border-border bg-card text-card-foreground shadow-sm font-sans",
              title: "text-sm font-medium text-foreground",
              description: "text-sm text-muted-foreground",
              success: "border-primary bg-primary text-primary-foreground",
              error: "border-destructive bg-destructive text-destructive-foreground",
              actionButton: "bg-primary text-primary-foreground",
              closeButton: "border-border bg-card text-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
