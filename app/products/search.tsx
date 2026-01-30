import BottomSheets from '@/components/BottomSheets';

import Scanner from '@/components/checkout/checkout/Scanner';

import { DeleteModal } from '@/components/DeleteModal';

import { ProductCard } from '@/components/ProductCard';

import { Skeleton } from '@/components/Skelaton';

import { useStateSearch } from '@/services/useStateSearch';

import { Ionicons } from '@expo/vector-icons';

import { router, Stack } from 'expo-router';

import React from 'react';

import {
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { RefreshControl } from 'react-native-gesture-handler';

export default function ProductsSearch() {
    const {
        branchName,
        totalItems,
        totalPrice,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isCategorySheetVisible,
        setIsCategorySheetVisible,
        categories,
        filteredProducts,
        products,
        isLoading,
        isError,
        errorMessage,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
        refetch,
        isConfirmVisible,
        setIsConfirmVisible,
        handleConfirmDelete,
        isScannerVisible,
        setScannerVisible,
        ScannerComponent,
        handleOpenScanner,
        handleBarCodeScanned,
    } = useStateSearch();

    const renderItem = ({ item }: { item: ProductPopular }) => (
        <View className="flex-1 px-1 mb-4">
            <ProductCard product={item} />
        </View>
    );

    const renderSearchSkeleton = () => (
        <View className="px-4 pt-4 pb-2">
            {Array.from({ length: 4 }).map((_, rowIndex) => (
                <View key={rowIndex} className="flex-row justify-between mb-4">
                    {[0, 1].map((col) => (
                        <View key={col} className="flex-1 mx-1">
                            <View className="bg-white rounded-3xl p-3 border border-gray-100">
                                <Skeleton height={140} radius={16} className="w-full mb-3" />
                                <Skeleton height={12} radius={999} width="40%" className="mb-2" />
                                <Skeleton height={14} radius={999} width="90%" className="mb-2" />
                                <Skeleton height={16} radius={999} width="55%" className="mb-3" />
                                <Skeleton height={36} radius={12} className="w-full" />
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    const renderFooter = () => {
        if (!hasNextPage || !isFetchingNextPage) return null;
        return (
            <View className="py-4 items-center">
                <View className="flex-row gap-2">
                    <Skeleton width={80} height={24} radius={12} />
                    <Skeleton width={80} height={24} radius={12} />
                </View>
            </View>
        );
    };

    const handleEndReached = () => {
        if (hasNextPage && !isFetchingNextPage && !searchQuery.trim()) {
            fetchNextPage();
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Cari Produk',
                    headerTitleStyle: { fontWeight: '600', fontSize: 18 },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="pl-2 pr-3 py-2"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View className="flex-1 bg-white">
                {branchName && isLoading && (
                    <View className="flex-1">
                        {renderSearchSkeleton()}
                    </View>
                )}

                {branchName && isError && !isLoading && (
                    <View className="flex-1 justify-center items-center px-6 py-12">
                        <Text className="text-gray-600 text-center mb-4">{errorMessage}</Text>
                        <TouchableOpacity
                            onPress={() => refetch()}
                            className="px-5 py-2 rounded-2xl bg-gray-900"
                        >
                            <Text className="text-white text-sm font-medium">Coba lagi</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {branchName && !isLoading && !isError && products.length === 0 && (
                    <View className="flex-1 justify-center items-center py-12">
                        <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-500 text-sm mt-3">Belum ada produk.</Text>
                    </View>
                )}

                {branchName && !isLoading && products.length > 0 && (
                    <>
                        <View className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
                            <View className="flex-row items-center">
                                <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-1 mr-3">
                                    <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                                    <TextInput
                                        placeholder="Cari nama, barcode, atau kategori..."
                                        placeholderTextColor="#9CA3AF"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        className="ml-3 flex-1 text-base text-gray-900"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setSearchQuery('')}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={handleOpenScanner}
                                    className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center"
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="scan" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsCategorySheetVisible(true)}
                                className="flex-row items-center mt-3 py-2"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="filter-outline" size={18} color="#6B7280" />
                                <Text className="ml-2 text-sm text-gray-600">
                                    Kategori: {selectedCategory ?? 'Semua'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#6B7280" className="ml-1" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filteredProducts}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
                            contentContainerStyle={{
                                paddingTop: 16,
                                paddingBottom: totalItems > 0 ? 88 : 24,
                            }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefetching}
                                    onRefresh={refetch}
                                />
                            }
                            renderItem={renderItem}
                            ListFooterComponent={searchQuery.trim() ? null : renderFooter}
                            onEndReached={handleEndReached}
                            onEndReachedThreshold={0.4}
                            ListEmptyComponent={
                                searchQuery.trim() ? (
                                    <View className="py-12 items-center">
                                        <Ionicons name="search-outline" size={40} color="#D1D5DB" />
                                        <Text className="text-gray-500 text-sm mt-2 text-center">
                                            Tidak ada hasil untuk &apos;{searchQuery.trim()}&apos;
                                        </Text>
                                    </View>
                                ) : null
                            }
                        />
                    </>
                )}

                {/* Bottom cart bar */}
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

                <DeleteModal
                    visible={isConfirmVisible}
                    title="Hapus keranjang?"
                    message="Apakah kamu yakin ingin menghapus semua item di keranjang?"
                    onCancel={() => setIsConfirmVisible(false)}
                    onConfirm={handleConfirmDelete}
                />

                <BottomSheets
                    visible={isCategorySheetVisible}
                    onClose={() => setIsCategorySheetVisible(false)}
                    title="Filter Kategori"
                >
                    <ScrollView
                        className="max-h-80 pb-6"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedCategory(null);
                                setIsCategorySheetVisible(false);
                            }}
                            className="py-3 px-3 rounded-xl active:bg-gray-100"
                            activeOpacity={0.7}
                        >
                            <Text
                                className={`text-base ${selectedCategory === null ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                            >
                                Semua
                            </Text>
                        </TouchableOpacity>
                        {categories
                            .filter((c) => c.is_active)
                            .map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => {
                                        setSelectedCategory(cat.name);
                                        setIsCategorySheetVisible(false);
                                    }}
                                    className="py-3 px-3 rounded-xl active:bg-gray-100"
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-base ${selectedCategory?.toLowerCase() === cat.name?.toLowerCase() ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                                    >
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>
                </BottomSheets>

                {ScannerComponent && (
                    <Scanner
                        visible={isScannerVisible}
                        onClose={() => setScannerVisible(false)}
                        ScannerComponent={ScannerComponent}
                        onBarCodeScanned={handleBarCodeScanned}
                    />
                )}
            </View>
        </>
    );
}
