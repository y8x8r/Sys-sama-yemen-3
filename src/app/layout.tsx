import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "سما اليمن للسفريات والسياحة | نظام الإدارة",
  description: "نظام إداري داخلي متكامل لمكتب سما اليمن للسفريات والسياحة",
  keywords: ["سما اليمن", "سفر", "سياحة", "حج", "عمرة", "تأشيرات"],
  authors: [{ name: "سما اليمن" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-cairo antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />

        {/* كود إزالة شريط وأدوات نتفلاي تلقائياً */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const removeDrawer = () => {
                const elements = document.querySelectorAll(
                  'netlify-drawer, #netlify-drawer-root, div[data-netlify-drawer], [class*="netlify-drawer"], iframe[src*="netlify"]'
                );
                elements.forEach(el => el.remove());
              };
              setInterval(removeDrawer, 200);
            `,
          }}
        />
      </body>
    </html>
  );
}