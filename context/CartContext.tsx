import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

type CartItem = {
    product: Product;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    getItemQuantity: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'cart';

function hasWebStorage() {
    return typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined';
}

function getInitialCart(): CartItem[] {
    if (!hasWebStorage()) return [];

    try {
        const stored = (globalThis as any).localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as CartItem[];
        }
    } catch (err) {
        console.error('Error parsing stored cart:', err);
        try {
            (globalThis as any).localStorage.removeItem(CART_STORAGE_KEY);
        } catch {
            // ignore
        }
    }
    return [];
}

type CartProviderProps = {
    children: React.ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>(getInitialCart);

    // Hydrate cart on native (AsyncStorage)
    useEffect(() => {
        if (hasWebStorage()) return;

        let isMounted = true;
        (async () => {
            try {
                const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (!isMounted) return;
                if (storedCart) {
                    setItems(JSON.parse(storedCart));
                }
            } catch (err) {
                console.error('Error loading stored cart:', err);
                await AsyncStorage.removeItem(CART_STORAGE_KEY);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    // Persist cart whenever it changes
    useEffect(() => {
        const persist = async () => {
            try {
                const serialized = JSON.stringify(items);
                if (hasWebStorage()) {
                    (globalThis as any).localStorage.setItem(CART_STORAGE_KEY, serialized);
                } else {
                    await AsyncStorage.setItem(CART_STORAGE_KEY, serialized);
                }
            } catch (err) {
                console.error('Error persisting cart:', err);
            }
        };

        if (items) {
            void persist();
        }
    }, [items]);

    const addItem = (product: Product, quantity: number = 1) => {
        if (!product || !product.id) return;

        setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.product.id === product.id);

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                };
                return updated;
            }

            return [...prev, { product, quantity }];
        });
    };

    const removeItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemQuantity = (productId: string) => {
        const found = items.find((item) => item.product.id === productId);
        return found?.quantity ?? 0;
    };

    const { totalItems, totalPrice } = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                acc.totalItems += item.quantity;
                acc.totalPrice += item.quantity * item.product.price;
                return acc;
            },
            { totalItems: 0, totalPrice: 0 },
        );
    }, [items]);

    const value: CartContextValue = {
        items,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        getItemQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within CartProvider');
    }
    return ctx;
}

