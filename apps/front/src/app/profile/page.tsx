"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "@/context/AuthContext";
import { GET_MY_ORDERS } from "@/graphql/orders";
import { UPDATE_USER_ROLE } from "@/graphql/user";
import OrderList from "@/components/profile/OrderList";
import OrderDetail from "@/components/profile/OrderDetail";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingBag, Store, User, ArrowLeft } from "lucide-react";

interface Order {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    items: any[];
}

export default function ProfilePage() {
    const { user, logout, login, token } = useAuth();
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const { data, loading, error } = useQuery<{ myOrders: Order[] }>(GET_MY_ORDERS, {
        skip: !user,
    });

    const [updateUserRole, { loading: updatingRole }] = useMutation(
        UPDATE_USER_ROLE,
        {
            onCompleted: (data: any) => {
                if (data?.updateUser && user && token) {
                    const updatedUser = { ...user, role: data.updateUser.role };
                    login(token, updatedUser);
                    alert("¡Felicidades! Ahora eres vendedor.");
                }
            },
            onError: (err) => {
                alert("Error al actualizar rol: " + err.message);
            },
        }
    );

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
                    <p className="mb-4 text-gray-600">Por favor inicia sesión para ver tu perfil.</p>
                    <Button onClick={() => router.push("/login")}>Iniciar Sesión</Button>
                </div>
            </div>
        );
    }

    const handleBecomeSeller = () => {
        if (confirm("¿Estás seguro de que quieres convertirte en vendedor?")) {
            updateUserRole({
                variables: {
                    id: user.id,
                    role: "SELLER",
                },
            });
        }
    };

    const handleSellerDashboard = () => {
        router.push("/seller/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Top Decoration / Header */}
            <div className="h-48 bg-gradient-to-r from-black via-zinc-900 to-red-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                {/* Navigation Bar inside Header */}
                <div className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
                    <div className="relative w-32 h-10 cursor-pointer" onClick={() => router.push("/")}>
                        <Image
                            src="/logo.png"
                            alt="Tunealo Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 hover:text-white gap-2"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft size={18} />
                        Volver a la tienda
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar / User Card */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-8">
                            <div className="p-8 flex flex-col items-center text-center border-b border-gray-100">
                                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 text-4xl font-bold mb-4 shadow-inner border-4 border-white ring-1 ring-gray-100">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-500 text-sm mb-3">{user.email}</p>
                                <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${user.role === 'SELLER'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {user.role === 'BUYER' ? 'Comprador' : user.role}
                                </span>
                            </div>

                            <div className="p-6 space-y-3">
                                {user.role !== "SELLER" && user.role !== "ADMIN" ? (
                                    <Button
                                        onClick={handleBecomeSeller}
                                        disabled={updatingRole}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200"
                                    >
                                        <Store className="mr-2 h-4 w-4" />
                                        {updatingRole ? "Procesando..." : "¡Quiero ser Vendedor!"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSellerDashboard}
                                        className="w-full bg-gray-900 text-white hover:bg-black"
                                    >
                                        <Store className="mr-2 h-4 w-4" />
                                        Panel de Vendedor
                                    </Button>
                                )}

                                <Button
                                    onClick={logout}
                                    variant="outline"
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </Button>
                            </div>

                            <div className="bg-gray-50 p-6 text-center">
                                <p className="text-xs text-gray-400">Miembro desde {new Date().getFullYear()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Mis Compras</h2>
                                    <p className="text-gray-500 text-sm">Gestiona y rastrea tus pedidos recientes</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
                                    <p>Cargando tu historial...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <p className="font-bold">Error al cargar compras</p>
                                        <p className="text-sm opacity-80">{error.message}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <OrderList orders={data?.myOrders || []} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle */}
            {selectedOrder && (
                <OrderDetail
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
