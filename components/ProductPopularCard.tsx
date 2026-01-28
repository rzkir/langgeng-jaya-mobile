import React from 'react';

import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useCart } from '@/context/CartContext';

import { router } from 'expo-router';

import Toast from 'react-native-toast-message';

type ProductPopularCardProps = {
    product: ProductPopular;
};

export function ProductPopularCard({ product }: ProductPopularCardProps) {
    const { addItem, getItemQuantity } = useCart();

    const hasImage = !!product.image_url;
    const quantityInCart = getItemQuantity(product.id);

    const handleAddToCart = () => {
        addItem(product, 1);
        Toast.show({
            type: 'success',
            topOffset: 50,
            text1: 'Ditambahkan ke keranjang',
            text2: product.name,
        });
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/products/${product.id}`)}
            className="bg-white rounded-3xl p-3 mb-4 border border-gray-100 shadow-sm"
        >
            {/* Gambar produk */}
            <View className="items-center justify-center mb-3 relative">
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

                {/* Badge sold */}
                <View className="absolute bottom-2 left-2 bg-gray-900/90 px-2 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-semibold">
                        Terjual {Number(product.sold ?? 0).toLocaleString('id-ID')}
                    </Text>
                </View>
            </View>

            {/* Badge kategori */}
            <View className="items-start mb-2">
                <View className="bg-red-100 px-2 py-0.5 rounded-full">
                    <Text className="text-red-500 text-[10px] font-semibold">
                        {product.category_name || 'Promo'}
                    </Text>
                </View>
            </View>

            {/* Nama & unit */}
            <View className="mb-1 flex-col gap-2">
                <Text className="text-gray-900 font-semibold text-md" numberOfLines={1}>
                    {product.name}
                </Text>

                <View className="flex-row items-center gap-1">
                    <Text className="text-gray-500 text-xs pr-1 border-r border-gray-200 capitalize" numberOfLines={2}>
                        {product.unit}
                    </Text>

                    <Text className="text-gray-500 text-xs" numberOfLines={1}>
                        Stok {product.stock}
                    </Text>
                </View>
            </View>

            {/* Harga + aksi */}
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
                    <TouchableOpacity
                        className="w-9 h-9 rounded-2xl bg-gray-900 items-center justify-center"
                        activeOpacity={0.8}
                        onPress={handleAddToCart}
                    >
                        <Ionicons name="cart" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

