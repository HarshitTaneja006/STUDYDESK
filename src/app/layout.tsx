import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "StudyDesk — Student Task Manager",
  description: "A friendly paper-styled task manager for students. Plan homework, exams and personal goals with due dates, priorities and stats.",
  keywords: ["student tasks", "homework planner", "task manager", "study planner", "PaperCSS"],
  authors: [{ name: "StudyDesk" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

// Inline script to set theme class before hydration to prevent FOUC.
const themeInitScript = `(function(){try{var t=localStorage.getItem('studydesk:theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark-theme');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PaperCSS framework - loaded as static asset */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/papercss/paper.min.css" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
