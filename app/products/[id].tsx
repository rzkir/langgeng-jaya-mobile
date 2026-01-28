import React from 'react'

import { Image, Pressable, ScrollView, Text, View, type DimensionValue } from 'react-native'

import { fetchProductDetails } from '@/services/FetchProducts'

import { router, useLocalSearchParams } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { useQuery } from '@tanstack/react-query'
import { MotiView } from 'moti'

export default function ProductsDetails() {
    const { id } = useLocalSearchParams()
    const { data, isLoading, error } = useQuery({
        queryKey: ['product-details', id],
        queryFn: () => fetchProductDetails(id as string),
        enabled: !!id,
    })

    const productDetails = data

    const SkeletonBox = ({
        width = '100%',
        height = 12,
        radius = 12,
        className = '',
    }: {
        width?: DimensionValue
        height?: number
        radius?: number
        className?: string
    }) => {
        return (
            <View className={className}>
                <MotiView
                    from={{ opacity: 0.35 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        type: 'timing',
                        duration: 900,
                        loop: true,
                    }}
                    style={{
                        width,
                        height,
                        borderRadius: radius,
                        backgroundColor: '#E5E7EB',
                    }}
                />
            </View>
        )
    }

    if (isLoading) {
        return (
            <View className="flex-1 bg-white">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    {/* Header */}
                    <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">
                        <View className="bg-gray-50 rounded-full p-2.5">
                            <Ionicons name="arrow-back" size={20} color="#D1D5DB" />
                        </View>
                    </View>

                    {/* Image skeleton */}
                    <View className="px-5 mb-6">
                        <View className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                            <SkeletonBox height={0} radius={0} className="w-full aspect-[4/3]" />
                        </View>
                    </View>

                    {/* Content skeleton */}
                    <View className="px-5">
                        <SkeletonBox height={26} radius={14} className="mb-3" />
                        <SkeletonBox height={18} radius={12} className="mb-5 w-3/5" />

                        <View className="flex-row gap-2 mb-6">
                            <SkeletonBox width={92} height={26} radius={10} />
                            <SkeletonBox width={110} height={26} radius={10} />
                        </View>

                        <SkeletonBox height={34} radius={14} className="mb-2 w-3/4" />
                        <SkeletonBox height={14} radius={10} className="mb-7 w-2/5" />

                        <SkeletonBox height={14} radius={10} className="mb-2" />
                        <SkeletonBox height={14} radius={10} className="mb-2 w-11/12" />
                        <SkeletonBox height={14} radius={10} className="mb-2 w-10/12" />
                    </View>

                    {/* Specs skeleton */}
                    <View className="px-5 mt-6">
                        <SkeletonBox height={18} radius={12} className="mb-4 w-2/5" />
                        <View className="bg-gray-50 rounded-2xl overflow-hidden">
                            <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                                <View className="bg-white rounded-lg p-2.5">
                                    <Ionicons name="resize-outline" size={18} color="#E5E7EB" />
                                </View>
                                <View className="flex-1">
                                    <SkeletonBox height={10} radius={8} className="mb-2 w-1/4" />
                                    <SkeletonBox height={14} radius={10} className="w-2/3" />
                                </View>
                            </View>
                            <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                                <View className="bg-white rounded-lg p-2.5">
                                    <Ionicons name="cube-outline" size={18} color="#E5E7EB" />
                                </View>
                                <View className="flex-1">
                                    <SkeletonBox height={10} radius={8} className="mb-2 w-1/5" />
                                    <SkeletonBox height={14} radius={10} className="w-1/2" />
                                </View>
                            </View>
                            <View className="px-4 py-3.5 flex-row items-center gap-3">
                                <View className="bg-white rounded-lg p-2.5">
                                    <Ionicons name="barcode-outline" size={18} color="#E5E7EB" />
                                </View>
                                <View className="flex-1">
                                    <SkeletonBox height={10} radius={8} className="mb-2 w-1/4" />
                                    <SkeletonBox height={14} radius={10} className="w-3/4" />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }

    if (error) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <View className="items-center max-w-sm">
                    <View className="bg-red-50 rounded-full p-5 mb-5">
                        <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                    </View>
                    <Text className="text-gray-900 text-lg font-semibold mb-2 text-center">
                        Gagal memuat data produk
                    </Text>
                    <Text className="text-gray-500 text-sm text-center leading-5">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                </View>
            </View>
        )
    }

    if (!productDetails) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <View className="items-center max-w-sm">
                    <View className="bg-gray-100 rounded-full p-5 mb-5">
                        <Ionicons name="cube-outline" size={40} color="#6B7280" />
                    </View>
                    <Text className="text-gray-900 text-lg font-semibold mb-2 text-center">
                        Produk tidak ditemukan
                    </Text>
                    <Text className="text-gray-500 text-sm text-center">
                        Produk yang Anda cari tidak tersedia
                    </Text>
                </View>
            </View>
        )
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        } catch {
            return dateString
        }
    }

    const isLowStock = productDetails.stock != null && productDetails.min_stock != null && productDetails.stock <= productDetails.min_stock

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="bg-gray-50 rounded-full p-2.5 active:bg-gray-100"
                    >
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </Pressable>
                </View>

                {/* Product Image */}
                <View className="px-5 mb-6">
                    <View className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                        {productDetails.image_url ? (
                            <Image
                                source={{ uri: productDetails.image_url }}
                                className="w-full aspect-[4/3]"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full aspect-[4/3] items-center justify-center bg-gray-50">
                                <View className="bg-white rounded-full p-5 mb-3">
                                    <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-400 text-sm font-medium">Tidak ada gambar</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Main Content */}
                <View className="px-5">
                    {/* Product Name */}
                    <Text className="text-gray-900 text-2xl font-bold leading-tight mb-4">
                        {productDetails.name || 'Nama Produk'}
                    </Text>

                    {/* Badges */}
                    <View className="flex-row gap-2 mb-6 flex-wrap">
                        {productDetails.category_name && (
                            <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                                <Text className="text-indigo-700 text-xs font-semibold">
                                    {productDetails.category_name}
                                </Text>
                            </View>
                        )}
                        <View className={`px-3 py-1.5 rounded-lg ${isLowStock ? 'bg-red-50' : 'bg-emerald-50'}`}>
                            <Text className={`text-xs font-semibold ${isLowStock ? 'text-red-700' : 'text-emerald-700'}`}>
                                Stock: {productDetails.stock ?? 0}
                            </Text>
                        </View>
                    </View>

                    {/* Price */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">Harga</Text>
                        <View className="flex-row items-baseline gap-2">
                            <Text className="text-gray-900 font-bold text-3xl tracking-tight">
                                Rp {productDetails.price ? productDetails.price.toLocaleString('id-ID') : '0'}
                            </Text>
                            {productDetails.unit && (
                                <Text className="text-gray-500 text-sm font-medium">
                                    / {productDetails.unit}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Overview Section */}
                    {productDetails.description && (
                        <View className="mb-6">
                            <Text className="text-gray-900 text-base font-semibold mb-3">Deskripsi</Text>
                            <Text className="text-gray-600 text-sm leading-6">
                                {productDetails.description}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Specifications Section */}
                <View className="px-5 mt-2">
                    <Text className="text-gray-900 text-base font-semibold mb-4">Spesifikasi</Text>

                    <View className="bg-gray-50 rounded-2xl overflow-hidden">
                        {/* Dimensions */}
                        <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                            <View className="bg-white rounded-lg p-2.5">
                                <Ionicons name="resize-outline" size={18} color="#6366F1" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-medium mb-0.5">Dimensi</Text>
                                <Text className="text-gray-900 font-medium text-sm">
                                    {productDetails.size ?? '-'} {productDetails.unit || ''}
                                </Text>
                            </View>
                        </View>

                        {/* Stock */}
                        <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                            <View className={`rounded-lg p-2.5 ${isLowStock ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                <Ionicons
                                    name={isLowStock ? "warning-outline" : "cube-outline"}
                                    size={18}
                                    color={isLowStock ? "#EF4444" : "#10B981"}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-medium mb-0.5">Stok</Text>
                                <Text className={`font-medium text-sm ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                    {productDetails.stock ?? 0} {productDetails.unit || ''} Tersedia
                                </Text>
                            </View>
                        </View>

                        {/* Sold */}
                        <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                            <View className="bg-orange-50 rounded-lg p-2.5">
                                <Ionicons name="trending-up-outline" size={18} color="#F97316" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-medium mb-0.5">Terjual</Text>
                                <Text className="text-gray-900 font-medium text-sm">
                                    {productDetails.sold ?? 0} {productDetails.unit || ''}
                                </Text>
                            </View>
                        </View>

                        {/* Barcode */}
                        <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                            <View className="bg-gray-100 rounded-lg p-2.5">
                                <Ionicons name="barcode-outline" size={18} color="#6B7280" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-medium mb-0.5">Barcode</Text>
                                <Text className="text-gray-900 font-medium text-sm">
                                    {productDetails.barcode || '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Branch */}
                        <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                            <View className="bg-indigo-50 rounded-lg p-2.5">
                                <Ionicons name="business-outline" size={18} color="#6366F1" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-medium mb-0.5">Cabang</Text>
                                <Text className="text-gray-900 font-medium text-sm">
                                    {productDetails.branch_name || '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Supplier */}
                        {productDetails.supplier_name && (
                            <View className="px-4 py-3.5 border-b border-gray-200/50 flex-row items-center gap-3">
                                <View className="bg-purple-50 rounded-lg p-2.5">
                                    <Ionicons name="people-outline" size={18} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs font-medium mb-0.5">Supplier</Text>
                                    <Text className="text-gray-900 font-medium text-sm">
                                        {productDetails.supplier_name}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Expiration Date */}
                        {productDetails.expiration_date && (
                            <View className="px-4 py-3.5 flex-row items-center gap-3">
                                <View className="bg-rose-50 rounded-lg p-2.5">
                                    <Ionicons name="calendar-outline" size={18} color="#F43F5E" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs font-medium mb-0.5">Tanggal Kadaluarsa</Text>
                                    <Text className="text-gray-900 font-medium text-sm">
                                        {formatDate(productDetails.expiration_date)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}