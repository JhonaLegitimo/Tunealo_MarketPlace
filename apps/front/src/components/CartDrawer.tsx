"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  // 🔧 luego esto vendrá del backend o del contexto del carrito
  const fakeCartItems = [
    { id: 1, name: "Filtro de aire", price: 15000, quantity: 2 },
    { id: 2, name: "Aceite 10W40", price: 35000, quantity: 1 },
  ];

  const total = fakeCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      {/* Botón del carrito */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative hover:opacity-80 transition"
      >
        🛒
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {fakeCartItems.length}
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

            {/* Panel del carrito */}
            <motion.div
              className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
                <h2 className="text-lg font-semibold">Tu carrito</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:opacity-80"
                >
                  ✖️
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 text-gray-800">
                {fakeCartItems.length === 0 ? (
                  <p className="text-gray-500 text-center mt-10">
                    Tu carrito está vacío 🛒
                  </p>
                ) : (
                  fakeCartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-blue-600">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t text-gray-900">
                <div className="flex justify-between mb-3 font-semibold">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => alert("Procesando compra...")}
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
