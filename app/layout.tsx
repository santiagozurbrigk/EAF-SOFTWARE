import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EAF — Evergreen de Alta Frecuencia',
    template: '%s | EAF',
  },
  description:
    'Plataforma de automatización de pauta y SDC para embudos high-ticket en Meta Ads.',
  robots: { index: false, follow: false }, // App privada
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
