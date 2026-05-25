import "./globals.css";

export const metadata = {
  title: "Sabana Brava 314 | PMS",
  description: "Sistema de gestión hotelera - Hotel Sabana Brava 314",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}