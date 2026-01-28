import React from 'react';

import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { RefreshControl } from 'react-native-gesture-handler';

import { useStateProducts } from '@/services/useStateProducts';

import { ProductCard } from '@/components/ProductCard';

import Scanner from '@/components/checkout/checkout/Scanner';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import { DeleteModal } from '@/components/DeleteModal';

export default function Products() {
    const {
        products,
        isLoading,
        error,
        errorMessage,

        totalItems,
        totalPrice,

        isRefreshing,
        handleRefresh,

        isScannerVisible,
        setScannerVisible,
        ScannerComponent,
        handleOpenScanner,
        handleBarCodeScanned,

        isConfirmVisible,
        setIsConfirmVisible,
        handleConfirmDelete,
    } = useStateProducts();

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: totalItems > 0 ? 80 : 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                <View className="bg-white px-4 pt-4 pb-4 rounded-b-3xl shadow-sm">
                    <View className="flex-row items-center">
                        <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-1 mr-3">
                            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                            <TextInput
                                placeholder="Cari menu favorit..."
                                placeholderTextColor="#9CA3AF"
                                className="ml-2 flex-1 text-sm text-gray-900"
                            />
                        </View>

                        <TouchableOpacity
                            className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center"
                            activeOpacity={0.85}
                            onPress={handleOpenScanner}
                        >
                            <Ionicons name="scan" size={18} color="#FFFFFF" />
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

            {/* Bottom cart bar - muncul hanya ketika ada item */}
            {totalItems > 0 && (
                <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                    <View className="bg-white rounded-3xl flex-row items-center justify-between px-5 py-3 shadow-xl border border-gray-100">
                        <View>
                            <Text className="text-xs text-gray-400">Keranjang</Text>
                            <Text className="text-base font-semibold text-gray-900">
                                {totalItems} item dipilih · Rp {totalPrice.toLocaleString('id-ID')}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                onPress={() => setIsConfirmVisible(true)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                className="w-11 h-11 rounded-2xl bg-red-50 items-center justify-center"
                            >
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push('/checkout' as any)}
                                className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center"
                                activeOpacity={0.85}
                            >
                                <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {ScannerComponent && (
                <Scanner
                    visible={isScannerVisible}
                    onClose={() => setScannerVisible(false)}
                    ScannerComponent={ScannerComponent}
                    onBarCodeScanned={handleBarCodeScanned}
                />
            )}

            {/* Modal konfirmasi hapus keranjang */}
            <DeleteModal
                visible={isConfirmVisible}
                title="Hapus keranjang?"
                message="Apakah kamu yakin ingin menghapus semua item di keranjang?"
                onCancel={() => setIsConfirmVisible(false)}
                onConfirm={handleConfirmDelete}
            />
        </View>
    );
}