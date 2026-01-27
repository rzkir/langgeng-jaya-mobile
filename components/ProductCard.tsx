import React from 'react';

import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useCart } from '@/context/CartContext';
import { router, usePathname } from 'expo-router';

type ProductCardProps = {
    product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
    const { addItem, getItemQuantity } = useCart();
    const pathname = usePathname();

    const hasImage = !!product.image_url;
    const quantityInCart = getItemQuantity(product.id);

    // Tentukan halaman saat ini
    const isProductsPage = pathname.includes('/products');
    const isBerandaPage = pathname.includes('/beranda');

    const handleAddToCart = () => {
        addItem(product, 1);
    };

    return (
        <View className="bg-white rounded-3xl p-3 mb-4 border border-gray-100 shadow-sm">
            {/* Gambar produk */}
            <View className="items-center justify-center mb-3">
                {hasImage ? (
                    <Image
                        source={{ uri: product.image_url }}
                        className="w-full aspect-[4/3] rounded-2xl"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full aspect-[4/3] rounded-2xl bg-gray-100 items-center justify-center">
                        <Text className="text-gray-400 text-xs">No Image</Text>
                    </View>
                )}
            </View>

            {/* Badge promo / kategori */}
            <View className="items-start mb-2">
                <View className="bg-red-100 px-2 py-0.5 rounded-full">
                    <Text className="text-red-500 text-[10px] font-semibold">
                        {product.category_name || 'Promo'}
                    </Text>
                </View>
            </View>

            {/* Nama & unit */}
            <View className="mb-1">
                <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                    {product.name}
                </Text>
                <Text className="text-gray-500 text-[11px]" numberOfLines={1}>
                    {product.unit}
                </Text>
            </View>

            {/* Harga */}
            <View className="mt-1">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-900 font-semibold text-base">
                            Rp {product.price.toLocaleString('id-ID')}
                        </Text>
                        {quantityInCart > 0 && (
                            <Text className="text-[11px] text-emerald-600 mt-0.5">
                                {quantityInCart}x di keranjang
                            </Text>
                        )}
                    </View>
                    <View className="flex-row gap-2">
                        {!isProductsPage && (
                            <TouchableOpacity
                                className="w-9 h-9 rounded-2xl bg-gray-900 items-center justify-center"
                                activeOpacity={0.8}
                                onPress={handleAddToCart}
                            >
                                <Ionicons name="add" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                        {!isBerandaPage && (
                            <TouchableOpacity
                                className="w-9 h-9 rounded-2xl bg-gray-900 items-center justify-center"
                                activeOpacity={0.8}
                                onPress={() => router.push(`/products/${product.id}`)}
                            >
                                <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

