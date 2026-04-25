import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lumina Chat',
  description: 'Experience the future of connection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white selection:bg-primary selection:text-white`}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <ToastContainer theme="dark" position="bottom-right" />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
