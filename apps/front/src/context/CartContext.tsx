"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CART } from "@/graphql/cart";
import { ADD_TO_CART, UPDATE_CART_ITEM, CLEAR_CART } from "@/graphql/mutations/cartMutations";

interface Product {
    id: number;
    title: string;
    price: number;
    images?: { url: string }[];
}

interface CartItem {
    id: string;
    product: Product;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    updateCartItem: (productId: number, quantity: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    total: number;
    totalItems: number;
    loading: boolean;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, token } = useAuth();
    const [localCart, setLocalCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Apollo Client hooks
    const { data: userCartData, loading: userCartLoading, refetch } = useQuery<{ myCart: { items: CartItem[] } }>(GET_CART, {
        skip: !token,
        fetchPolicy: "network-only",
    });

    const [addToCartMutation] = useMutation(ADD_TO_CART);
    const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM);
    const [clearCartMutation] = useMutation(CLEAR_CART);

    // Load local cart on mount
    useEffect(() => {
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) {
            try {
                setLocalCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Error parsing local cart", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save local cart when it changes (only if not logged in)
    useEffect(() => {
        if (isInitialized && !token) {
            localStorage.setItem("guestCart", JSON.stringify(localCart));
        }
    }, [localCart, isInitialized, token]);

    // Merge guest cart to user cart on login
    useEffect(() => {
        const mergeCarts = async () => {
            if (token && localCart.length > 0) {
                console.log("🔄 Merging guest cart with user cart...");
                try {
                    for (const item of localCart) {
                        await addToCartMutation({
                            variables: {
                                addToCartInput: {
                                    productId: item.product.id,
                                    quantity: item.quantity,
                                },
                            },
                            context: {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        });
                    }
                    // Clear local cart after successful merge
                    setLocalCart([]);
                    localStorage.removeItem("guestCart");
                    await refetch();
                    console.log("✅ Cart merged successfully!");
                } catch (error) {
                    console.error("❌ Error merging carts:", error);
                }
            }
        };

        if (token && isInitialized) {
            mergeCarts();
        }
    }, [token, localCart, isInitialized, addToCartMutation, refetch]);

    // Determine which cart to use
    const cartItems: CartItem[] = token
        ? userCartData?.myCart?.items || []
        : localCart;

    const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = async (product: Product, quantity = 1) => {
        if (token) {
            try {
                await addToCartMutation({
                    variables: {
                        addToCartInput: {
                            productId: product.id,
                            quantity,
                        },
                    },
                    context: {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                });
                await refetch();
            } catch (error) {
                console.error("Error adding to backend cart:", error);
                throw error;
            }
        } else {
            setLocalCart((prev) => {
                const existingItemIndex = prev.findIndex(
                    (item) => item.product.id === product.id
                );

                if (existingItemIndex >= 0) {
                    const newCart = [...prev];
                    newCart[existingItemIndex].quantity += quantity;
                    return newCart;
                } else {
                    return [
                        ...prev,
                        {
                            id: `local-${Date.now()}`,
                            product,
                            quantity,
                        },
                    ];
                }
            });
        }
    };

    const updateCartItem = async (productId: number, quantity: number) => {
        if (quantity < 1) return;

        if (token) {
            try {
                await updateCartItemMutation({
                    variables: {
                        updateCartItemInput: {
                            productId,
                            quantity,
                        },
                    },
                    context: {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                });
                await refetch();
            } catch (error) {
                console.error("Error updating backend cart:", error);
            }
        } else {
            setLocalCart((prev) =>
                prev.map((item) =>
                    item.product.id === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const removeFromCart = async (productId: number) => {
        if (token) {
            // TODO: Implement backend remove
            console.warn("Backend remove not fully implemented in this context yet");
        } else {
            setLocalCart((prev) => prev.filter((item) => item.product.id !== productId));
        }
    };

    const clearCart = async () => {
        if (token) {
            try {
                await clearCartMutation({
                    context: {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                });
                await refetch();
            } catch (error) {
                console.error("Error clearing backend cart:", error);
            }
        } else {
            setLocalCart([]);
            localStorage.removeItem("guestCart");
        }
    };

    const [isCartOpen, setIsCartOpen] = useState(false);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateCartItem,
                removeFromCart,
                clearCart,
                total,
                totalItems,
                loading: token ? userCartLoading : false,
                isCartOpen,
                openCart,
                closeCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
