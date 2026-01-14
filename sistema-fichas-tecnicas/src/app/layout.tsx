import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GlobalProviders } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Fichas Técnicas de Pozos',
  description: 'Aplicación para generar, editar y personalizar fichas técnicas de pozos de alcantarillado',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <GlobalProviders>
          {children}
        </GlobalProviders>
      </body>
    </html>
  );
}
