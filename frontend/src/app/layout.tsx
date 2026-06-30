import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import PageTransition from './components/PageTransition'
import LoadingScreen from './components/LoadingScreen'
import SplashScreen from './components/SplashScreen'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'AdalatAI — Free Legal Aid for Every Pakistani Citizen',
    template: '%s | AdalatAI',
  },
  description:
    'AdalatAI is an autonomous 6-agent AI system giving Pakistani citizens free access to legal rights, documents, and justice — in Urdu and English.',
  keywords: [
    'legal aid Pakistan', 'free legal advice Pakistan', 'AI lawyer Pakistan',
    'قانونی مدد', 'مفت قانونی مشورہ', 'AdalatAI', 'Pakistani law AI',
    'Urdu legal help', 'legal document Pakistan', 'free legal aid',
    'Pakistan legal rights', 'AI legal system Pakistan',
  ],
  authors:  [{ name: 'Fatima Ali Khan' }],
  creator:  'Fatima Ali Khan',
  metadataBase: new URL('https://adalat-ai.vercel.app'),
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://adalat-ai.vercel.app',
    siteName:    'AdalatAI',
    title:       'AdalatAI — Free Legal Aid for Every Pakistani Citizen',
    description: 'AdalatAI is an autonomous 6-agent AI system giving Pakistani citizens free access to legal rights, documents, and justice — in Urdu and English.',
    images: [{
      url:    '/opengraph-image',
      width:  1200,
      height: 630,
      alt:    'AdalatAI — Free Legal Aid for Every Pakistani Citizen',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'AdalatAI — Free Legal Aid for Every Pakistani Citizen',
    description: 'AdalatAI is an autonomous 6-agent AI system giving Pakistani citizens free access to legal rights, documents, and justice — in Urdu and English.',
    images:      ['/opengraph-image'],
  },
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Noto Nastaliq Urdu — loaded via <link> so it works for inline urdu class usage */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <LoadingScreen />
          <SplashScreen />
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  )
}
