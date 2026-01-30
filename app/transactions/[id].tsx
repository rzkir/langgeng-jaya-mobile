import React, { useMemo } from 'react'

import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { StatusPill } from '@/components/Badge'
import { fetchTransactionDetail } from '@/services/FetchTransactions'

import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'

function parseItems(itemsJson: string): TransactionItemPayload[] {
    try {
        const parsed = JSON.parse(itemsJson || '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function TransactionDetails() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data, isLoading, error } = useQuery({
        queryKey: ['transaction-detail', id],
        queryFn: () => fetchTransactionDetail(id as string),
        enabled: !!id,
    })

    const items = useMemo(
        () => (data?.items ? parseItems(data.items) : []),
        [data?.items],
    )

    if (isLoading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-3 text-gray-500">Memuat detail transaksi...</Text>
            </View>
        )
    }

    if (error || !data) {
        return (
            <View className="flex-1 bg-white px-5 justify-center">
                <View className="bg-white rounded-2xl p-6 border border-gray-100">
                    <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center self-center mb-4">
                        <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
                    </View>
                    <Text className="text-center text-gray-900 font-semibold text-base">
                        Gagal memuat transaksi
                    </Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        className="mt-6 bg-[#7C3AED] py-3 rounded-2xl active:opacity-80"
                    >
                        <Text className="text-center text-white font-semibold">Kembali</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    const paymentLabel =
        data.payment_method === 'cash' ? 'Tunai' : data.payment_method === 'kasbon' ? 'Kasbon' : data.payment_method
    const paymentStatusLabel =
        data.payment_status === 'paid' ? 'Lunas' : data.payment_status === 'partial' ? 'Sebagian' : 'Belum bayar'

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-4 flex-row items-center">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:opacity-70"
                >
                    <Ionicons name="arrow-back" size={22} color="#374151" />
                </Pressable>
                <Text className="flex-1 ml-3 text-lg font-bold text-gray-900" numberOfLines={1}>
                    Detail Transaksi
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16, paddingTop: 16 }}
            >
                {/* Info transaksi */}
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                    <View className="px-5 py-4 border-b border-gray-100">
                        <Text className="text-xs text-gray-400 font-medium">No. Transaksi</Text>
                        <Text className="text-base font-bold text-gray-900 mt-0.5">{data.transaction_number}</Text>
                    </View>
                    <View className="px-5 py-4 flex-row flex-wrap gap-3">
                        <View className="flex-1 min-w-[140px]">
                            <Text className="text-xs text-gray-400">Pelanggan</Text>
                            <Text className="text-sm font-semibold text-gray-900 mt-0.5">{data.customer_name}</Text>
                        </View>
                        <View className="flex-1 min-w-[140px]">
                            <Text className="text-xs text-gray-400">Cabang</Text>
                            <Text className="text-sm font-semibold text-gray-900 mt-0.5">{data.branch_name}</Text>
                        </View>
                    </View>
                    <View className="px-5 py-4 flex-row items-center justify-between border-t border-gray-100">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-xs text-gray-400">Status</Text>
                            <StatusPill status={data.status} />
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Ionicons
                                name={data.payment_method === 'cash' ? 'cash-outline' : 'receipt-outline'}
                                size={18}
                                color="#6B7280"
                            />
                            <Text className="text-sm font-medium text-gray-700">{paymentLabel}</Text>
                            <Text className="text-xs text-gray-400">•</Text>
                            <Text className="text-xs text-gray-500">{paymentStatusLabel}</Text>
                        </View>
                    </View>
                </View>

                {/* Daftar item */}
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                    <View className="px-5 py-4 border-b border-gray-100">
                        <Text className="text-sm font-bold text-gray-900">Daftar Barang</Text>
                    </View>
                    {items.length === 0 ? (
                        <View className="px-5 py-8">
                            <Text className="text-center text-gray-400 text-sm">Tidak ada item</Text>
                        </View>
                    ) : (
                        items.map((item, index) => (
                            <View
                                key={`${item.product_id}-${index}`}
                                className="px-5 py-4 flex-row items-center border-b border-gray-100 last:border-b-0"
                            >
                                {item.image_url ? (
                                    <Image
                                        source={{ uri: item.image_url }}
                                        className="w-14 h-14 rounded-xl bg-gray-100"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-14 h-14 rounded-xl bg-gray-100 items-center justify-center">
                                        <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
                                    </View>
                                )}
                                <View className="flex-1 ml-4">
                                    <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
                                        {item.product_name}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-0.5">
                                        {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                                        {item.unit ? ` / ${item.unit}` : ''}
                                    </Text>
                                </View>
                                <Text className="text-sm font-bold text-gray-900">
                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Ringkasan pembayaran */}
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                    <View className="px-5 py-4 border-b border-gray-100">
                        <Text className="text-sm font-bold text-gray-900">Ringkasan</Text>
                    </View>
                    <View className="px-5 py-4">
                        <View className="flex-row justify-between py-2">
                            <Text className="text-sm text-gray-500">Subtotal</Text>
                            <Text className="text-sm font-medium text-gray-900">
                                Rp {data.subtotal.toLocaleString('id-ID')}
                            </Text>
                        </View>
                        {data.discount > 0 && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-sm text-gray-500">Diskon</Text>
                                <Text className="text-sm font-medium text-gray-900">
                                    - Rp {data.discount.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        )}
                        <View className="flex-row justify-between py-3 border-t border-gray-100 mt-2">
                            <Text className="text-base font-bold text-gray-900">Total</Text>
                            <Text className="text-base font-bold text-[#7C3AED]">
                                Rp {data.total.toLocaleString('id-ID')}
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2 mt-1">
                            <Text className="text-sm text-gray-500">Dibayar</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                                Rp {data.paid_amount.toLocaleString('id-ID')}
                            </Text>
                        </View>
                        {data.due_amount > 0 && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-sm text-gray-500">Sisa</Text>
                                <Text className="text-sm font-semibold text-amber-600">
                                    Rp {data.due_amount.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Audit */}
                <View className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                    <Text className="text-xs text-gray-400">Dibuat oleh {data.created_by}</Text>
                    <Text className="text-xs text-gray-400 mt-1">{formatDate(data.created_at)}</Text>
                </View>
            </ScrollView>
        </View>
    )
}