import "./globals.css";
import { ApolloWrapper } from "./providers";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ApolloWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}