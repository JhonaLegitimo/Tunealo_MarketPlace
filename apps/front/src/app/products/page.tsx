import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/'; 

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      title
      price
      image
    }
  }
`;

export default function ProductsPage() {
  const { data, loading, error } = useQuery(GET_PRODUCTS);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Productos disponibles</h1>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.products?.map((product) => (
          <div
            key={product.id}
            className="bg-white border rounded shadow p-4"
          >
            <img
              src={product.image || '/placeholder.png'}
              alt={product.title}
              className="w-full h-48 object-cover mb-4"
            />
            <h2 className="font-semibold text-lg">{product.title}</h2>
            <p className="text-gray-600">${product.price}</p>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
