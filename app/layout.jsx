import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

//custom libs
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { ConnectionsProvider } from "@/context/ConnectionsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata = {
  title: "OneMe - Your Digital Identity",
  description:
    "One link for your digital identity. Create, customize, and share your personal profile, social links, and contact information.",
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`
        ${geistSans.variable} 
        ${geistMono.variable} 
        h-full 
        antialiased
        text-sans
        bg-bg-primary
        text-text-primary
        `}
    >
      <body
        className="
          min-h-full 
          flex flex-col
        "
      >
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <ConnectionsProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </ConnectionsProvider>
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
