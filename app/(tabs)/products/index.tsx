import React, { useMemo } from 'react';

import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';

import { fetchKaryawanProducts } from '@/services/FetchProducts';

import { ProductCard } from '@/components/ProductCard';

import { Ionicons } from '@expo/vector-icons';

export default function Products() {
    const { user } = useAuth();
    const branchName = user?.branchName || '';

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['karyawan-products', branchName],
        queryFn: () => fetchKaryawanProducts(branchName),
        enabled: !!branchName,
    });

    const products = useMemo(() => data?.data ?? [], [data]);

    const errorMessage =
        error instanceof Error ? error.message : 'Gagal memuat produk';

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="bg-white px-4 pt-4 pb-4 rounded-b-3xl shadow-sm">
                    <View className="flex-row items-center">
                        <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mr-3">
                            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                            <TextInput
                                placeholder="Cari menu favorit..."
                                placeholderTextColor="#9CA3AF"
                                className="ml-2 flex-1 text-sm text-gray-900"
                            />
                        </View>

                        <TouchableOpacity className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center">
                            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Loading State */}
                {isLoading && (
                    <View className="mt-2 px-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <View
                                key={index}
                                className="flex-row justify-between mb-4"
                            >
                                {[0, 1].map((col) => (
                                    <View
                                        key={col}
                                        className="flex-1 mx-1 bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse"
                                    >
                                        <View className="w-full aspect-[4/3] rounded-2xl bg-gray-200 mb-3" />
                                        <View className="w-14 h-4 rounded-full bg-gray-200 mb-3" />
                                        <View className="w-32 h-4 rounded-full bg-gray-200 mb-2" />
                                        <View className="w-20 h-3 rounded-full bg-gray-200 mb-3" />
                                        <View className="w-24 h-4 rounded-full bg-gray-200" />
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <View className="px-4 mt-4">
                        <Text className="text-red-500 text-sm">
                            {errorMessage}
                        </Text>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && !error && products.length === 0 && (
                    <View className="px-4 mt-4">
                        <Text className="text-gray-500 text-sm">Belum ada produk.</Text>
                    </View>
                )}

                <View className="px-6 mt-4 flex-row items-center justify-between">
                    <Text className="text-2xl font-bold text-gray-900">Semua Produk</Text>
                    <Text className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">{products.length} produk</Text>
                </View>

                {/* Products Grid */}
                {!isLoading && !error && products.length > 0 && (
                    <View className="mt-4 px-4">
                        <FlatList
                            data={products}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            renderItem={({ item }) => (
                                <View className="flex-1 px-1">
                                    <ProductCard product={item} />
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
