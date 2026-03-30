import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "PTM Community",
  description: "Connect, share, and grow with your community",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "PTM Community",
    description: "Connect, share, and grow with your community",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#080B14" />
      </head>
      <body className="bg-ptm-bg text-ptm-text font-body min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#141929",
                color: "#E8EAF6",
                border: "1px solid #1E2640",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#10B981", secondary: "#141929" },
              },
              error: {
                iconTheme: { primary: "#EC4899", secondary: "#141929" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
