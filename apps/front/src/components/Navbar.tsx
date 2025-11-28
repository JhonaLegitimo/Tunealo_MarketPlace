"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { user, logout, token } = useAuth();

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-6">
        <Link href="/home" className="font-bold text-lg hover:underline">
          🏠 Tunealo Market
        </Link>
        <Link href="/products" className="hover:underline">
          Productos
        </Link>
        <CartDrawer />
      </div>

      <div className="flex items-center gap-4">
        {token ? (
          <>
            <Link
              href="/profile"
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>👤</span>
              <span>Hola, {user?.name || "Usuario"}</span>
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-200"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
