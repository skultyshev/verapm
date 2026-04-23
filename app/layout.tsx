import type { Metadata } from 'next'
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Vera PM — Property Management',
  description: 'Modern property management software for professionals',
  icons: { icon: '/favicon.ico' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
