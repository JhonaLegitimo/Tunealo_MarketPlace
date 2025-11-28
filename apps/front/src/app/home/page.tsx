"use client";

import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import ProductCard from "@/components/ProductCard";

const GET_PRODUCTS = gql`
  query {
    products {
      products {
        id
        title
        price
        images {
          url
        }
      }
    }
  }
`;

interface ProductImage {
  url: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  images?: ProductImage[];
}

interface ProductsData {
  products: {
    products: Product[];
  };
}

export default function HomePage() {
  const { data, loading, error } = useQuery<ProductsData>(GET_PRODUCTS);

  if (loading) return <p className="p-6 text-center">Cargando productos...</p>;
  if (error)
    return (
      <p className="p-6 text-center text-red-500">
        Error al cargar productos 😞
      </p>
    );

  const products = data?.products?.products || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Productos disponibles</h1>

      {products.length === 0 ? (
        <p>No hay productos disponibles aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
