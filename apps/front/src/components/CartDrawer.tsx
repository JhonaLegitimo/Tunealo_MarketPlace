"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import { GET_CART } from "@/graphql/cart";

interface CartProduct {
  id: number;
  title: string;
  price: number;
}

interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading } = useQuery(GET_CART);

  const cartItems: CartItem[] = data?.cart?.items || [];
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <>
      {/* Botón del carrito (navbar) */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative hover:opacity-80 transition"
        aria-label="Abrir carrito"
      >
        🛒
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Drawer lateral animado */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel lateral derecho */}
            <motion.div
              className="fixed right-0 top-0 w-80 h-full bg-white shadow-xl z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
                <h2 className="text-lg font-semibold">Tu carrito</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-300"
                >
                  ✖️
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-4 text-black">
                {loading ? (
                  <p className="text-gray-500 text-center mt-10">
                    Cargando carrito...
                  </p>
                ) : cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center mt-10">
                    Tu carrito está vacío 🛒
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.product.title}</p>
                        <p className="text-gray-600">
                          {item.quantity} × ${item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Footer con total */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between font-semibold mb-3">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => alert("🛍️ Procesando compra...")}
                >
                  Finalizar compra
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
