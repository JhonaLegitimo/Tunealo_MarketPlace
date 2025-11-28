"use client";

import { useMutation } from "@apollo/client/react";
import {  GET_CART } from "@/graphql/cart";
import {ADD_TO_CART} from  "@/graphql/mutations/cartMutations";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [addToCart] = useMutation(ADD_TO_CART, {
    update(cache, { data }) {
      const newItem = data?.addToCart;
      if (!newItem) return;

      // Leer el carrito actual de la caché
      const existingCart: any = cache.readQuery({ query: GET_CART });

      // Si el carrito no existe aún, lo inicializamos
      if (!existingCart?.cart) {
        cache.writeQuery({
          query: GET_CART,
          data: {
            cart: { id: 1, items: [newItem] },
          },
        });
        return;
      }

      // Si el producto ya existe, actualiza la cantidad
      const existingItem = existingCart.cart.items.find(
        (i: any) => i.product.id === newItem.product.id
      );

      let updatedItems;
      if (existingItem) {
        updatedItems = existingCart.cart.items.map((i: any) =>
          i.product.id === newItem.product.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      } else {
        updatedItems = [...existingCart.cart.items, newItem];
      }

      // Escribimos el carrito actualizado
      cache.writeQuery({
        query: GET_CART,
        data: {
          cart: {
            ...existingCart.cart,
            items: updatedItems,
          },
        },
      });
    },
  });

  const handleAdd = async () => {
    try {
      await addToCart({ variables: { productId, quantity: 1 } });
      alert("✅ Producto agregado correctamente");
    } catch (error) {
      console.error(error);
      alert("❌ Error al agregar al carrito");
    }
  };

  return (
    <button
      onClick={handleAdd}
      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
    >
      Agregar al carrito
    </button>
  );
}