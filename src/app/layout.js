import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata = {
  title: 'TBH Medical Stock Manager',
  description:
    'Medical inventory management — therapeutic navigation, FIFO dispensing, batch tracking, and caravan event support.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased font-sans`}>
        <TooltipProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  )
}
