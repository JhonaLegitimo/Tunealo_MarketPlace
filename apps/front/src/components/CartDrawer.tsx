"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/context/AuthContext";

// 🔹 Query para obtener el carrito del usuario actual
const GET_MY_CART = gql`
  query {
    myCart {
      id
      totalItems
      subtotal
      items {
        id
        quantity
        product {
          id
          title
          price
          images {
            url
          }
        }
      }
    }
  }
`;

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  const { data, loading, error } = useQuery(GET_MY_CART, {
    skip: !token, // evita llamar si no hay sesión
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  });

  const cart = data?.myCart;

  return (
    <>
      {/* Botón del carrito */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative hover:opacity-80 transition"
      >
        🛒
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {cart?.totalItems ?? 0}
        </span>
      </button>

      {/* Drawer lateral */}
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

            {/* Panel lateral */}
            <motion.div
              className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Tu carrito</h2>
                <button onClick={() => setIsOpen(false)}>✖️</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {loading && <p>Cargando carrito...</p>}
                {error && (
                  <p className="text-red-500">
                    Error al cargar el carrito 😞
                  </p>
                )}
                {!loading && !cart && <p>No hay productos en tu carrito 🛒</p>}
                {cart?.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${item.product.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {cart && (
                <div className="p-4 border-t">
                  <div className="flex justify-between mb-3 font-semibold">
                    <span>Total:</span>
                    <span>${cart.subtotal.toLocaleString()}</span>
                  </div>
                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={() => alert("Procesando compra...")}
                  >
                    Finalizar compra
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}