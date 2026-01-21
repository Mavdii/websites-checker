import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cruel Stack - Website Analysis Platform',
  description: 'Professional website analysis and technical forensics platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
