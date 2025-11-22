"use client";

import { gql } from "@apollo/client/core";
import { useMutation } from "@apollo/client/react";
import { ADD_TO_CART } from "@/graphql/mutations/addToCart";
import { useAuth } from "@/context/AuthContext";

export default function ProductCard({ product }: { product: any }) {
  const { token } = useAuth();
  const [addToCart, { loading }] = useMutation(ADD_TO_CART);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        variables: {
          productId: product.id,
          quantity: 1,
        },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      });
      alert(`✅ ${product.title} agregado al carrito`);
    } catch (err) {
      console.error(err);
      alert("Error al agregar el producto al carrito");
    }
  };

  return (
    <div className="border rounded p-4 shadow-sm flex flex-col items-center text-center bg-white hover:shadow-md transition">
      <img
        src={product.images?.[0]?.url || "/placeholder.png"}
        alt={product.title}
        className="w-40 h-40 object-cover mb-4 rounded"
      />
      <h3 className="font-semibold text-lg">{product.title}</h3>
      <p className="text-gray-600 mb-2">${product.price.toLocaleString()}</p>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Agregando..." : "Agregar al carrito"}
      </button>
    </div>
  );
}
