"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";


import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER } from "@/graphql/mutations/orderMutations";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, total, loading, removeFromCart, updateCartItem, clearCart } = useCart();
  const { token } = useAuth();
  const router = useRouter();

  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER);

  const handleCheckout = async () => {
    if (!token) {
      alert("⚠️ Debes iniciar sesión para finalizar la compra");
      setIsOpen(false);
      router.push("/login");
      return;
    }

    try {
      await createOrder({
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      alert("✅ ¡Compra realizada con éxito!");
      await clearCart();
      setIsOpen(false);
      router.push("/profile");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("❌ Error al procesar la compra. Inténtalo de nuevo.");
    }
  };

  return (
    <>
      {/* Botón del carrito (navbar) */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-600 hover:text-primary transition-colors hover:scale-110 duration-200 relative"
        aria-label="Abrir carrito"
      >
        <ShoppingCart size={20} />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center shadow-sm">
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
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel lateral derecho */}
            <motion.div
              className="fixed right-4 top-4 w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden"
              style={{ maxHeight: "600px" }}
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="text-primary" size={24} />
                  Tu carrito
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  ✖️
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Cargando carrito...</p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                    <ShoppingCart size={64} className="text-gray-300" />
                    <p className="text-lg font-medium">Tu carrito está vacío</p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-primary hover:underline"
                    >
                      Explorar productos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        {/* Imagen del producto */}
                        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          {/* Nota: Necesitamos importar Image de next/image */}
                          <img
                            src={item.product.images?.[0]?.url || "/placeholder.svg"}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info del producto */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">
                              {item.product.title}
                            </h3>
                            <p className="text-primary font-bold mt-1">
                              ${item.product.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                              <button
                                onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-primary disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-primary"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer con total */}
              <div className="p-6 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || creatingOrder}
                  >
                    <span>{creatingOrder ? "Procesando..." : "Finalizar compra"}</span>
                    {!creatingOrder && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                  </button>

                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Vaciar carrito
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
