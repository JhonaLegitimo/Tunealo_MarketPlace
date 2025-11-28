"use client"

import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import CartDrawer from "@/components/CartDrawer"
import { usePathname } from "next/navigation"

export default function Header() {
    const { user, token, logout } = useAuth()
    const pathname = usePathname()

    // Only show header on home page and product details page
    const isHomePage = pathname === "/"
    const isProductPage = pathname?.startsWith("/products/")

    if (!isHomePage && !isProductPage) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="relative w-32 h-10 block">
                        <Image
                            src="/logo.png"
                            alt="Tunealo Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
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
    )
}
