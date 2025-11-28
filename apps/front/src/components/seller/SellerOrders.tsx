import React from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SELLER_ORDERS, UPDATE_ORDER_STATUS } from "@/graphql/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SellerOrdersData {
    sellerOrders: {
        id: number;
        total: number;
        status: string;
        createdAt: string;
        buyer: {
            name: string;
            email: string;
        };
        items: {
            id: number;
            quantity: number;
            unitPrice: number;
            product: {
                title: string;
                images: { url: string }[];
            };
        }[];
    }[];
}

export default function SellerOrders() {
    const { data, loading, error, refetch } = useQuery<SellerOrdersData>(GET_SELLER_ORDERS, {
        fetchPolicy: "network-only",
        notifyOnNetworkStatusChange: true,
    });
    const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, {
        onCompleted: () => {
            alert("Estado actualizado correctamente");
            refetch();
        },
        onError: (error) => {
            alert("Error al actualizar estado: " + error.message);
        }
    });

    const handleStatusChange = (orderId: number, newStatus: string) => {
        updateStatus({
            variables: {
                input: {
                    orderId: orderId,
                    status: newStatus,
                },
            },
        });
    };

    if (loading) return <div className="p-8 text-center">Cargando órdenes...</div>;
    if (error) return (
        <div className="p-8 text-center text-red-500">
            Error al cargar órdenes: {error.message}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">Reintentar</Button>
        </div>
    );

    const orders = data?.sellerOrders || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Órdenes de Compra</h2>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <p className="text-gray-500">No tienes órdenes aún.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), "dd MMM yyyy", { locale: es })}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.buyer.name}</span>
                                            <span className="text-xs text-gray-500">{order.buyer.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>${order.total}</TableCell>
                                    <TableCell>
                                        {order.status === "COMPLETED" ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>
                                        ) : (
                                            <Select
                                                value={order.status}
                                                onValueChange={(val) => handleStatusChange(order.id, val)}
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                                    <SelectItem value="PAID">Pagado</SelectItem>
                                                    <SelectItem value="SHIPPED">Enviado</SelectItem>
                                                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Reportar problema
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div >
            )
            }
        </div >
    );
}
