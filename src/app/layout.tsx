import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { AppProvider } from '@/context/AppContext'
import { PageTransitionWrapper } from '@/components/layout/PageTransitionWrapper'

export const metadata: Metadata = {
  title: 'Equazion',
  description: 'Commercial Pricing Intelligence | PwC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto bg-page-bg">
                <PageTransitionWrapper>{children}</PageTransitionWrapper>
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
