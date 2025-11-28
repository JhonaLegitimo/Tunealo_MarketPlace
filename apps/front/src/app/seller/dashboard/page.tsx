"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "@/context/AuthContext";
import { GET_MY_PRODUCTS, GET_TAGS, CREATE_PRODUCT } from "@/graphql/products";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Package, DollarSign, Layers, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function SellerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        categoryIds: [] as string[],
        imageUrls: "",
        published: true,
    });

    // Redirect if not seller
    useEffect(() => {
        if (!authLoading && (!user || user.role !== "SELLER")) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // Queries
    const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(GET_MY_PRODUCTS, {
        variables: { sellerId: user?.id, take: 50 },
        skip: !user,
    });

    const { data: tagsData } = useQuery(GET_TAGS);

    // Mutation
    const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
        onCompleted: () => {
            alert("Producto creado exitosamente");
            setIsCreating(false);
            setFormData({
                title: "",
                description: "",
                price: "",
                stock: "",
                categoryIds: [],
                imageUrls: "",
                published: true,
            });
            refetchProducts();
        },
        onError: (err: any) => {
            console.error("Error creating product:", err);
            let errorMessage = err.message;
            // Extract detailed validation errors if available
            if (err.graphQLErrors?.[0]?.extensions?.originalError?.message) {
                const originalMessage = err.graphQLErrors[0].extensions.originalError.message;
                if (Array.isArray(originalMessage)) {
                    errorMessage = originalMessage.join(", ");
                } else {
                    errorMessage = originalMessage;
                }
            }
            alert("Error al crear producto: " + errorMessage);
        },
    });

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user || user.role !== "SELLER") {
        return null; // Will redirect via useEffect
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const price = parseFloat(formData.price);
        const stock = parseInt(formData.stock);

        if (isNaN(price) || price < 0.01) {
            alert("El precio debe ser un número válido mayor a 0.01");
            return;
        }
        if (isNaN(stock) || stock < 0) {
            alert("El stock debe ser un número válido mayor o igual a 0");
            return;
        }
        if (formData.description.length < 10) {
            alert("La descripción debe tener al menos 10 caracteres");
            return;
        }

        createProduct({
            variables: {
                input: {
                    title: formData.title,
                    description: formData.description,
                    price: price,
                    stock: stock,
                    published: formData.published,
                    categoryIds: formData.categoryIds.map(id => parseInt(id)),
                    imageUrls: formData.imageUrls.split(",").map(url => url.trim()).filter(url => url),
                },
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900">Panel de Vendedor</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden sm:block">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-gray-500">Vendedor</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sidebar / Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4">Acciones Rápidas</h2>
                            <Button
                                className="w-full justify-start gap-2 mb-2"
                                onClick={() => setIsCreating(true)}
                                variant={isCreating ? "secondary" : "default"}
                            >
                                <Plus className="h-4 w-4" />
                                Crear Nuevo Producto
                            </Button>
                            <Button
                                className="w-full justify-start gap-2"
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                            >
                                <Package className="h-4 w-4" />
                                Ver Mis Productos
                            </Button>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-2">Resumen de Ventas</h3>
                            <p className="opacity-80 text-sm mb-4">Tus estadísticas de este mes</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <p className="text-xs opacity-70">Total Ventas</p>
                                    <p className="text-2xl font-bold">$0</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <p className="text-xs opacity-70">Pedidos</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {isCreating ? (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Crear Producto</h2>
                                    <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancelar</Button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Nombre del Producto</Label>
                                        <Input
                                            id="title"
                                            placeholder="Ej. Batería 12V Bosch"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Detalles del producto..."
                                            className="h-32"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Precio ($)</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    className="pl-9"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stock">Stock Disponible</Label>
                                            <div className="relative">
                                                <Layers className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="stock"
                                                    type="number"
                                                    className="pl-9"
                                                    placeholder="0"
                                                    min="0"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría</Label>
                                        <Select
                                            onValueChange={(val) => setFormData({ ...formData, categoryIds: [val] })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tagsData?.tags?.map((tag: any) => (
                                                    <SelectItem key={tag.id} value={tag.id.toString()}>
                                                        {tag.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="images">URLs de Imágenes (separadas por coma)</Label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="images"
                                                className="pl-9"
                                                placeholder="https://..., https://..."
                                                value={formData.imageUrls}
                                                onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Por ahora solo soportamos URLs externas.</p>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Publicar inmediatamente</Label>
                                            <p className="text-sm text-gray-500">El producto será visible en la tienda</p>
                                        </div>
                                        <Switch
                                            checked={formData.published}
                                            onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-black text-white hover:bg-gray-800 h-12 text-lg"
                                        disabled={creating}
                                    >
                                        {creating ? "Creando..." : "Crear Producto"}
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Mis Productos</h2>
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                        {productsData?.products?.totalCount || 0} productos
                                    </span>
                                </div>

                                {productsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : productsData?.products?.products?.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">No tienes productos aún</h3>
                                        <p className="text-gray-500 mb-6">Comienza a vender creando tu primer producto</p>
                                        <Button onClick={() => setIsCreating(true)}>Crear Producto</Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {productsData?.products?.products?.map((product: any) => (
                                            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                                <div className="h-20 w-20 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                                    {product.images?.[0]?.url ? (
                                                        <Image
                                                            src={product.images[0].url}
                                                            alt={product.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-300">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                                                    <p className="text-purple-600 font-bold">${product.price}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {product.published ? 'Publicado' : 'Borrador'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">Editar</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
