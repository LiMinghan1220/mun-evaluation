import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '联合国模拟大会评价系统',
  description: '一个优雅的评价反馈系统',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <AuthProvider>
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
