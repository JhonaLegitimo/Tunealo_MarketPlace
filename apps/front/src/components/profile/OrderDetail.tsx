import React from "react";

interface OrderItem {
    id: number;
    quantity: number;
    unitPrice: number;
    product: {
        title: string;
        images: { url: string }[];
    };
}

interface Order {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface OrderDetailProps {
    order: Order;
    onClose: () => void;
}

export default function OrderDetail({ order, onClose }: OrderDetailProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Detalles de Orden #{order.id}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Tracker (Simplified) */}
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
                        <div
                            className={`flex flex-col items-center ${["PENDING", "PAID", "SHIPPED", "COMPLETED"].includes(
                                order.status
                            )
                                    ? "text-blue-600"
                                    : ""
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 border-current">
                                1
                            </div>
                            <span>Pendiente</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                        <div
                            className={`flex flex-col items-center ${["PAID", "SHIPPED", "COMPLETED"].includes(order.status)
                                    ? "text-blue-600"
                                    : ""
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 border-current">
                                2
                            </div>
                            <span>Pagado</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                        <div
                            className={`flex flex-col items-center ${["SHIPPED", "COMPLETED"].includes(order.status)
                                    ? "text-blue-600"
                                    : ""
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 border-current">
                                3
                            </div>
                            <span>Enviado</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                        <div
                            className={`flex flex-col items-center ${order.status === "COMPLETED" ? "text-blue-600" : ""
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 border-current">
                                4
                            </div>
                            <span>Entregado</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Productos</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center border-b pb-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={item.product.images[0]?.url || "/placeholder.png"}
                                            alt={item.product.title}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{item.product.title}</p>
                                            <p className="text-sm text-gray-500">
                                                Cant: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-medium">${item.unitPrice.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-xl text-blue-600">
                            ${order.total.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
