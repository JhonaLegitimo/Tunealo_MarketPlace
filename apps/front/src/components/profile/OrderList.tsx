import React from "react";

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
            title: string;
            images: { url: string }[];
        };
    }[];
}

interface OrderListProps {
    orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
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
                        <div className="text-right">
                            <p className="font-bold text-blue-600">
                                ${order.total.toFixed(2)}
                            </p>
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        {order.items.map((item) => (
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
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
