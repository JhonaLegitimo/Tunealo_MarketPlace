import "./globals.css";
import { ApolloWrapper } from "./providers";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar"; // Importa el Navbar
import CartDrawer from "../components/CartDrawer";  // Asegúrate de importar el CartDrawer

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <ApolloWrapper>
          <AuthProvider>
            {/* Aquí va la Barra de Navegación */}
            <Navbar />
            
            {/* Aquí va el Carrito */}
            <CartDrawer />

            {/* El contenido principal */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
