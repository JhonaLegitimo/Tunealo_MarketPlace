"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

interface ProductImage {
    url: string;
}

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    images?: ProductImage[];
}

interface ProductDetailsModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
    const { addToCart, loading } = useCart();

    if (!product) return null;

    const handleAddToCart = async () => {
        try {
            await addToCart(product, 1);
            alert(`✅ ${product.title} agregado al carrito`);
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`Error al agregar el producto al carrito: ${err.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Section */}
                    <div className="relative h-64 md:h-auto bg-gray-100">
                        <Image
                            src={product.images?.[0]?.url || "/placeholder.svg"}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col h-full">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold mb-2">{product.title}</DialogTitle>
                            <div className="text-3xl font-bold text-primary mb-4">
                                ${product.price.toLocaleString("es-ES")}
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 mb-6">
                            <DialogDescription className="text-base text-gray-600 leading-relaxed">
                                {product.description}
                            </DialogDescription>
                        </div>

                        <div className="mt-auto pt-4 border-t">
                            <Button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                {loading ? (
                                    "Agregando..."
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart size={24} />
                                        Agregar al carrito
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
