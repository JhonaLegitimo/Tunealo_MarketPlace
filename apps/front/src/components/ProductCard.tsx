"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { ADD_TO_CART } from "@/graphql/mutations/cartMutations";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@apollo/client/react";
import { GET_CART } from "@/graphql/cart"; // Asegúrate de importar correctamente la consulta GET_CART

export default function ProductCard({ product }: { product: any }) {
  const { token } = useAuth();
  const [addToCart, { loading }] = useMutation(ADD_TO_CART);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        variables: {
          addToCartInput: { // Aquí pasamos el objeto esperado por la mutación
            productId: product.id,
            quantity: 1,
          },
        },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        update(cache, { data }) {
          const existingCart = cache.readQuery({
            query: GET_CART, // Ahora la consulta está definida
          });

          // Verificar si el carrito existe, si no, inicializar uno vacío
          if (existingCart && existingCart.cart) {
            // Asegúrate de que el campo 'id' esté presente en el producto
            cache.writeQuery({
              query: GET_CART,
              data: {
                cart: {
                  ...existingCart.cart,
                  items: [
                    ...existingCart.cart.items,
                    {
                      id: product.id, // Asegúrate de incluir el 'id' aquí
                      product: product,
                      quantity: 1,
                    },
                  ],
                },
              },
            });
          } else {
            // Si no hay carrito, inicializa uno vacío y agrega el producto
            cache.writeQuery({
              query: GET_CART,
              data: {
                cart: {
                  items: [
                    {
                      id: product.id, // Asegúrate de incluir el 'id' aquí
                      product: product,
                      quantity: 1,
                    },
                  ],
                },
              },
            });
          }
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
