"use client"

import { Search, Bell, ShoppingCart, X, Heart, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useQuery } from "@apollo/client/react"
import { GET_PRODUCTS } from "@/graphql/products"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import CartDrawer from "@/components/CartDrawer"

interface ProductImage {
  url: string;
}

interface Seller {
  name: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  avgRating?: number;
  images: ProductImage[];
  seller: Seller;
}

interface ProductsData {
  products: {
    products: Product[];
  };
}

export default function Home() {
  const { data, loading, error } = useQuery<ProductsData>(GET_PRODUCTS);
  const { user, token, logout } = useAuth();

  const products = data?.products?.products || [];

  // Helper to generate random sales count for demo
  const getSalesCount = (id: number) => Math.floor((id * 1234) % 500) + 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-32 h-10">
              <Image
                src="/logo.png"
                alt="Tunealo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 transition-all hover:bg-gray-150 focus-within:ring-2 ring-primary/50">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar autopartes, accesorios..."
                className="bg-transparent outline-none flex-1 text-sm text-gray-600 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-primary transition-colors hover:scale-110 duration-200">
              <Bell size={20} />
            </button>
            <CartDrawer />
            {token ? (
              <div className="flex items-center gap-4">
                <span className="font-medium text-sm hidden sm:block">
                  Hola, {user?.name || "Usuario"}
                </span>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className="rounded-full px-4 hover:bg-gray-100 font-medium"
                  >
                    Perfil
                  </Button>
                </Link>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="rounded-full px-6 hover:bg-red-50 text-red-600 border-red-200"
                >
                  Salir
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 transition-all hover:shadow-lg">
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex items-center gap-1 px-6 py-3 overflow-x-auto scrollbar-hide">
          <div className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-800 transition-colors cursor-pointer">
            Ofertas
          </div>
          {[
            "Motor",
            "Suspensión",
            "Frenos",
            "Rines & Llantas",
            "Audio",
            "Interior",
            "Carrocería",
            "Iluminación",
            "Performance",
          ].map((category) => (
            <button
              key={category}
              className="px-4 py-1 text-sm text-gray-600 hover:text-primary hover:bg-red-50 whitespace-nowrap transition-all rounded-full"
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Hero Banner */}
        <div className="relative mb-16 rounded-3xl overflow-hidden bg-gradient-to-r from-black via-zinc-900 to-red-900 p-12 text-white shadow-2xl hover:shadow-2xl transition-shadow duration-300 group">
          <div className="max-w-2xl relative z-10">
            <h1 className="text-5xl font-bold mb-4 text-balance group-hover:text-white transition-all italic">
              TU VEHÍCULO A TU MANERA.
            </h1>
            <p className="text-lg mb-8 opacity-95 leading-relaxed text-gray-200">
              Encuentra las mejores autopartes y accesorios para personalizar tu auto. Calidad y rendimiento garantizados.
            </p>
            <Button className="bg-primary text-white hover:bg-red-600 rounded-full font-bold px-8 py-3 transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-white/20">
              Ver Catálogo
            </Button>
          </div>

          {/* Animated Decorative Icon */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-float">
            <div className="w-48 h-48 flex items-center justify-center">
              <ShoppingCart size={120} className="text-red-500" />
            </div>
          </div>

          {/* Close Button */}
          <button className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all hover:scale-110">
            <X size={24} />
          </button>
        </div>

        {/* Products Grid - Pinterest-style Masonry */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">Cargando productos increíbles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-xl text-red-500">Error al cargar productos. Intenta nuevamente.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="break-inside-avoid"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100">
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-auto bg-gray-200 h-64">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Free Shipping Badge */}
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform transition-transform group-hover:scale-110">
                        ENVÍO GRATIS
                      </div>

                      {/* Action Buttons - Show on Hover */}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                        <button className="bg-white/90 hover:bg-white rounded-full p-2 backdrop-blur transition-all shadow-lg hover:scale-110">
                          <Heart size={18} className="text-red-500" />
                        </button>
                        <button className="bg-white/90 hover:bg-white rounded-full p-2 backdrop-blur transition-all shadow-lg hover:scale-110">
                          <Share2 size={18} className="text-blue-500" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                          {product.seller?.name || "Vendedor Verificado"}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>{product.avgRating ? product.avgRating.toFixed(1) : "4.8"}</span>
                          <span className="text-gray-400 font-normal">({getSalesCount(product.id)} vendidos)</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-foreground mb-1">
                        ${product.price.toLocaleString("es-ES")}
                      </div>
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-snug mb-4">{product.description}</p>

                      <button className="w-full bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 rounded-lg font-medium transition-all hover:shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}