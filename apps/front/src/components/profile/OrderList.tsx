import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CONFIRM_ORDER_DELIVERY } from "@/graphql/orders";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import { ReviewModal } from "./ReviewModal";
import { useAuth } from "@/context/AuthContext";

interface Order {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    items: {
        id: number;
        quantity: number;
        unitPrice: number;
        product: {
            id: number;
            title: string;
            images: { url: string }[];
            reviews?: {
                id: number;
                rating: number;
                content: string;
                isAnonymous: boolean;
                author: { id: number };
            }[];
        };
    }[];
}

interface OrderListProps {
    orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
    const { user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const [confirmDelivery, { loading }] = useMutation(CONFIRM_ORDER_DELIVERY, {
        onCompleted: () => {
            alert("Entrega confirmada. ¡Gracias por tu compra!");
            window.location.reload(); // Simple reload to refresh data
        },
        onError: (err) => {
            alert("Error al confirmar entrega: " + err.message);
        }
    });

    const handleConfirm = (orderId: number) => {
        if (confirm("¿Confirmas que has recibido tu pedido correctamente?")) {
            confirmDelivery({ variables: { orderId } });
        }
    };

    const handleOpenReview = (product: any, review?: any) => {
        setSelectedProduct({
            id: product.id,
            title: product.title,
            image: product.images[0]?.url || "/placeholder.png"
        });
        setSelectedReview(review);
        setIsReviewModalOpen(true);
    };

    if (orders.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No tienes compras registradas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <div>
                            <p className="font-bold text-lg">Orden #{order.id}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <p className="font-bold text-blue-600">
                                ${order.total.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${order.status === "COMPLETED"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {order.status}
                                </span>
                                {order.status === "SHIPPED" && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                                        onClick={() => handleConfirm(order.id)}
                                        disabled={loading}
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Confirmar Entrega
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {order.items.map((item) => {
                            // Find if user has reviewed this product
                            const myReview = item.product.reviews?.find(r => r.author.id === user?.id);

                            return (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img
                                        src={item.product.images[0]?.url || "/placeholder.png"}
                                        alt={item.product.title}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.product.title}</p>
                                        <p className="text-xs text-gray-500">
                                            Cant: {item.quantity} x ${item.unitPrice.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Review Star Interaction */}
                                    {order.status === "COMPLETED" && (
                                        <div className="flex flex-col items-end">
                                            <div
                                                className="flex cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => handleOpenReview(item.product, myReview)}
                                                title={myReview ? "Editar tu reseña" : "Escribir una reseña"}
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={16}
                                                        fill={myReview && myReview.rating >= star ? "#fbbf24" : "none"}
                                                        className={myReview && myReview.rating >= star ? "text-yellow-400" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                            {!myReview && (
                                                <span className="text-[10px] text-blue-600 font-medium animate-pulse cursor-pointer" onClick={() => handleOpenReview(item.product, myReview)}>
                                                    ¡Deja tu reseña!
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {selectedProduct && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    product={selectedProduct}
                    existingReview={selectedReview}
                />
            )}
        </div>
    );
}
