import { useAuth } from '@/context/AuthContext';

import { ProductCard } from '@/components/ProductCard';

import { DeleteModal } from '@/components/DeleteModal';

import { fetchCategories, fetchKaryawanProducts } from '@/services/FetchProducts';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import React, { useMemo, useState } from 'react';

import {
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useQuery } from '@tanstack/react-query';

import { useCart } from '@/context/CartContext';

import AntDesign from '@expo/vector-icons/AntDesign';

// Helper function untuk mendapatkan icon berdasarkan nama kategori
const getCategoryIcon = (categoryName: string): keyof typeof Ionicons.glyphMap => {
    const name = categoryName.toLowerCase();

    if (name.includes('sembako')) {
        return 'storefront-outline';
    } else if (name.includes('minuman')) {
        return 'water-outline';
    } else if (name.includes('material')) {
        return 'construct-outline';
    } else if (name.includes('kebutuhan rumah') || name.includes('rumah')) {
        return 'home-outline';
    }

    // Default icon jika tidak cocok
    return 'cube-outline';
};

export default function Beranda() {
    const { user } = useAuth();
    const { totalItems, totalPrice, clearCart } = useCart();
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

    const {
        data: categoriesData,
        isLoading: categoriesLoading,
        error: categoriesError,
    } = useQuery({
        queryKey: ['karyawan-categories', branchName],
        queryFn: fetchCategories,
    });

    const categories = categoriesData?.data ?? [];

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleMenu = () => {
        // TODO: Implement menu functionality
    };

    const errorMessage =
        error instanceof Error ? error.message : 'Gagal memuat produk';

    const categoriesErrorMessage =
        categoriesError instanceof Error ? categoriesError.message : 'Gagal memuat kategori';

    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!selectedCategory) {
            return products;
        }
        return products.filter(
            (product) =>
                product.category_name &&
                product.category_name.toLowerCase() === selectedCategory.toLowerCase(),
        );
    }, [products, selectedCategory]);

    const handleConfirmDelete = () => {
        clearCart();
        setIsConfirmVisible(false);
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: totalItems > 0 ? 80 : 0 }}
            >
                {/* Header ala lokasi & user */}
                <View className="bg-white px-4 pt-4 pb-4 rounded-b-3xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-5">
                        <TouchableOpacity
                            onPress={handleMenu}
                            className="items-center justify-center left-1"
                        >
                            <AntDesign name="align-left" size={24} color="black" />
                        </TouchableOpacity>

                        <View className="items-center flex-1">
                            <Text className="text-[11px] text-gray-400">Lokasi Toko</Text>
                            <View className="flex-row items-center mt-1">
                                <Ionicons name="location-outline" size={16} color="#EF4444" />
                                <Text className="text-gray-900 text-sm font-semibold mx-1">
                                    {user?.branchName || 'Pilih cabang'}
                                </Text>
                            </View>
                        </View>

                        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                            <Text className="text-gray-700 font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </View>

                    {/* Search + Filter */}
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

                {/* Kategori horizontal */}
                <View className="mt-4 px-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-semibold text-gray-900">Kategori</Text>
                    </View>

                    {categoriesLoading && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 24 }}
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <View
                                    key={index}
                                    className="mr-4 items-center animate-pulse"
                                >
                                    <View className="w-12 h-12 rounded-full bg-gray-200 mb-1" />
                                    <View className="w-10 h-3 rounded-full bg-gray-200" />
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {categoriesError && !categoriesLoading && (
                        <Text className="text-red-500 text-sm">
                            {categoriesErrorMessage}
                        </Text>
                    )}

                    {!categoriesLoading && !categoriesError && categories?.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 24, gap: 14 }}
                        >
                            {/* All / Semua category */}
                            <TouchableOpacity
                                className="items-center"
                                activeOpacity={0.8}
                                onPress={() => setSelectedCategory(null)}
                            >
                                <View
                                    className={`w-14 h-14 rounded-full shadow-sm items-center justify-center mb-1 border ${!selectedCategory
                                        ? 'bg-gray-900 border-gray-900'
                                        : 'bg-white border-gray-100'
                                        }`}
                                >
                                    <Ionicons
                                        name="grid-outline"
                                        size={20}
                                        color={!selectedCategory ? '#FFFFFF' : '#374151'}
                                    />
                                </View>
                                <Text
                                    className={`text-[11px] ${!selectedCategory
                                        ? 'text-gray-900 font-semibold'
                                        : 'text-gray-600'
                                        }`}
                                    numberOfLines={1}
                                >
                                    Semua
                                </Text>
                            </TouchableOpacity>

                            {categories.map((item) => {
                                const isActive =
                                    selectedCategory &&
                                    item.name.toLowerCase() === selectedCategory.toLowerCase();
                                const iconName = getCategoryIcon(item.name);

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        className="items-center"
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            setSelectedCategory((prev) =>
                                                prev &&
                                                    prev.toLowerCase() ===
                                                    item.name.toLowerCase()
                                                    ? null
                                                    : item.name,
                                            )
                                        }
                                    >
                                        <View
                                            className={`w-14 h-14 rounded-full shadow-sm items-center justify-center mb-1 border ${isActive
                                                ? 'bg-gray-900 border-gray-900'
                                                : 'bg-white border-gray-100'
                                                }`}
                                        >
                                            <Ionicons
                                                name={iconName}
                                                size={20}
                                                color={isActive ? '#FFFFFF' : '#374151'}
                                            />
                                        </View>
                                        <Text
                                            className={`text-[11px] ${isActive
                                                ? 'text-gray-900 font-semibold'
                                                : 'text-gray-600'
                                                }`}
                                            numberOfLines={1}
                                        >
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Produk grid */}
                <View className="mt-6 px-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-semibold text-gray-900">
                            Rekomendasi untukmu
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
                            <Text className="text-sm text-blue-500 font-medium">Lihat semua</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading && (
                        <View className="mt-2">
                            {Array.from({ length: 4 }).map((_, index) => (
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

                    {error && !isLoading && (
                        <Text className="text-red-500 text-sm">
                            {errorMessage}
                        </Text>
                    )}

                    {!isLoading && !error && filteredProducts?.length === 0 && (
                        <Text className="text-gray-500 text-sm">Belum ada produk.</Text>
                    )}

                    {!isLoading && !error && filteredProducts?.length > 0 && (
                        <FlatList
                            data={filteredProducts}
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
                    )}
                </View>
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

                            <TouchableOpacity className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center">
                                <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
