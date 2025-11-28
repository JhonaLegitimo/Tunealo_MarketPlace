"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";

interface ProductImage {
  url: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  images?: ProductImage[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1);
      alert(`✅ ${product.title} agregado al carrito`);
    } catch (err: any) {
      console.error(err);
      alert(`Error al agregar el producto al carrito: ${err.message}`);
    }
  };

  return (
    <div className="border rounded p-4 shadow-sm flex flex-col items-center text-center bg-white hover:shadow-md transition">
      <div className="relative w-40 h-40 mb-4">
        <Image
          src={product.images?.[0]?.url || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover rounded"
        />
      </div>
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
