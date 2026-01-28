import React, { useMemo } from 'react';

import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import { useCart } from '@/context/CartContext';

function formatRupiah(value: number) {
    return `Rp ${Math.max(0, Math.round(value)).toLocaleString('id-ID')}`;
}

export default function Checkout() {
    const { items, totalItems, totalPrice, removeItem, updateItemQuantity, clearCart } = useCart();

    const subtotal = totalPrice;
    const discount = 0;
    const total = subtotal - discount;

    const isEmpty = items.length === 0;

    const lines = useMemo(() => {
        return items.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            unit: it.product.unit,
            image_url: it.product.image_url,
            price: it.product.price,
            quantity: it.quantity,
        }));
    }, [items]);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-11 h-11 rounded-2xl bg-gray-100 items-center justify-center"
                    activeOpacity={0.85}
                >
                    <Ionicons name="chevron-back" size={20} color="#111827" />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <Text className="text-gray-900 font-semibold text-base">Checkout</Text>
                    <Text className="text-gray-400 text-xs">{totalItems} item</Text>
                </View>

                <TouchableOpacity
                    onPress={clearCart}
                    className="w-11 h-11 rounded-2xl bg-red-50 items-center justify-center"
                    activeOpacity={0.85}
                    disabled={isEmpty}
                >
                    <Ionicons name="trash-outline" size={20} color={isEmpty ? '#FCA5A5' : '#EF4444'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 170 }}
                className="px-4"
            >
                {/* Cart items */}
                {isEmpty ? (
                    <View className="mt-10 items-center">
                        <View className="w-16 h-16 rounded-3xl bg-gray-100 items-center justify-center">
                            <Ionicons name="cart-outline" size={28} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold mt-4">Keranjang kosong</Text>
                        <Text className="text-gray-500 text-sm mt-1 text-center">
                            Tambahkan produk dulu, lalu kembali ke sini untuk checkout.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/beranda' as any)}
                            className="mt-5 px-5 py-3 rounded-2xl bg-gray-900"
                            activeOpacity={0.9}
                        >
                            <Text className="text-white font-semibold">Kembali belanja</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="mt-2">
                        {lines.map((item) => {
                            const hasImage = !!item.image_url;
                            return (
                                <View
                                    key={item.id}
                                    className="bg-white border border-gray-100 shadow-sm rounded-3xl p-3 mb-4"
                                >
                                    <View className="flex-row">
                                        {/* image */}
                                        <View className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden">
                                            {hasImage ? (
                                                <Image
                                                    source={{ uri: item.image_url }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center">
                                                    <Text className="text-gray-400 text-[10px]">No Image</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* info */}
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                    <Text className="text-gray-500 text-[11px]" numberOfLines={1}>
                                                        {item.unit}
                                                    </Text>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => removeItem(item.id)}
                                                    className="w-9 h-9 rounded-2xl bg-red-50 items-center justify-center"
                                                    activeOpacity={0.85}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>

                                            <View className="mt-3 flex-row items-center justify-between">
                                                <Text className="text-gray-900 font-semibold text-base">
                                                    {formatRupiah(item.price)}
                                                </Text>

                                                {/* stepper */}
                                                <View className="flex-row items-center bg-gray-100 rounded-2xl px-2 py-2">
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            updateItemQuantity(item.id, Math.max(0, item.quantity - 1))
                                                        }
                                                        className="w-8 h-8 rounded-xl bg-white items-center justify-center"
                                                        activeOpacity={0.85}
                                                    >
                                                        <Ionicons name="remove" size={18} color="#111827" />
                                                    </TouchableOpacity>

                                                    <Text className="mx-3 text-gray-900 font-semibold min-w-[18px] text-center">
                                                        {item.quantity}
                                                    </Text>

                                                    <TouchableOpacity
                                                        onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-xl bg-emerald-500 items-center justify-center"
                                                        activeOpacity={0.85}
                                                    >
                                                        <Ionicons name="add" size={18} color="#FFFFFF" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Summary + actions */}
            <View className="absolute bottom-0 left-0 right-0 px-5 pb-6">
                <View className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-500 text-sm">Sub total :</Text>
                        <Text className="text-gray-900 font-semibold text-sm">{formatRupiah(subtotal)}</Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-500 text-sm">Discount :</Text>
                        <Text className="text-gray-900 font-semibold text-sm">{formatRupiah(discount)}</Text>
                    </View>

                    <View className="h-px bg-gray-100 mb-3" />

                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 font-semibold text-sm">total :</Text>
                        <Text className="text-gray-900 font-semibold text-sm">{formatRupiah(total)}</Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white items-center"
                            activeOpacity={0.9}
                            disabled={isEmpty}
                        >
                            <Text className="text-gray-900 font-semibold">Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-2xl items-center ${isEmpty ? 'bg-emerald-200' : 'bg-emerald-500'
                                }`}
                            activeOpacity={0.9}
                            disabled={isEmpty}
                        >
                            <Text className="text-white font-semibold">Charge</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}