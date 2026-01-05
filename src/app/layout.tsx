import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MotionProvider } from '@/components/motion-provider';
import { DataProvider } from '@/lib/data-context';
import { MainLayout } from '@/components/main-layout';
import { PWARegister } from '@/components/pwa-register';

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'MyHomeBudget - Master Your Money',
  description: 'Track expenses, manage budgets, and get AI-powered financial insights.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icons/icon-192x192.png',
  },
  themeColor: '#0f172a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${ptSans.variable} font-sans antialiased`}>
        <MotionProvider>
          <DataProvider>
            <PWARegister />
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
          </DataProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
