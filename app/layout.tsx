import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "./components/AppShell";

export const metadata: Metadata = { title: "IELTS Writing Mastery", description: "Interactive IELTS Writing Task 2 learning platform" };

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="kk"><body><AppShell>{children}</AppShell></body></html>}
