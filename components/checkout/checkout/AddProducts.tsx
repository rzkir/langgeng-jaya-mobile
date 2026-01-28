import React from 'react';

import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import BottomSheets from '@/components/BottomSheets';

import { Skeleton } from '@/components/Skelaton';

import { ProductCard } from '@/components/ProductCard';

export default function AddProducts({
    visible,
    onClose,

    searchQuery,
    onChangeSearchQuery,

    isProductsLoading,
    productsError,
    products,
    filteredProducts,

    onPressScan,
}: AddProductsProps) {
    return (
        <BottomSheets
            visible={visible}
            onClose={onClose}
            title="Tambah item"
        >
            <View className="mt-1 max-h-[500px]">
                {/* Search & Scan */}
                <View className="flex-row items-center mb-3 gap-2">
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-3 py-2">
                        <Ionicons name="search-outline" size={18} color="#6B7280" />
                        <TextInput
                            className="flex-1 ml-2 py-2 text-gray-900"
                            placeholder="Cari nama / barcode produk"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={onChangeSearchQuery}
                        />
                    </View>

                    <TouchableOpacity
                        className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center"
                        activeOpacity={0.85}
                        onPress={onPressScan}
                    >
                        <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {isProductsLoading && (
                    <FlatList
                        data={Array.from({ length: 6 }, (_, i) => i.toString())}
                        keyExtractor={(item) => item}
                        showsVerticalScrollIndicator={false}
                        numColumns={2}
                        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
                        renderItem={() => (
                            <View className="flex-1 bg-gray-100 rounded-2xl p-3">
                                <Skeleton height={140} radius={16} className="w-full mb-3" />
                                <Skeleton height={12} radius={999} width="75%" className="mb-2" />
                                <Skeleton height={12} radius={999} width="50%" />
                            </View>
                        )}
                    />
                )}

                {!!productsError && !isProductsLoading && (
                    <Text className="text-red-500 text-sm">
                        {productsError instanceof Error
                            ? (productsError as Error).message
                            : 'Gagal memuat produk.'}
                    </Text>
                )}

                {!isProductsLoading && !productsError && products.length === 0 && (
                    <Text className="text-gray-500 text-sm">Belum ada produk.</Text>
                )}

                {!isProductsLoading && !productsError && products.length > 0 && filteredProducts.length === 0 && (
                    <Text className="text-gray-500 text-sm">Produk tidak ditemukan.</Text>
                )}

                {!isProductsLoading && !productsError && filteredProducts.length > 0 && (
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        numColumns={2}
                        columnWrapperStyle={{ gap: 8 }}
                        renderItem={({ item }) => (
                            <View className="flex-1">
                                <ProductCard product={item} />
                            </View>
                        )}
                    />
                )}
            </View>
        </BottomSheets>
    );
}
