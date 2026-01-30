import React, { useMemo } from 'react'

import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import { StatusPill } from '@/components/Badge'

import BottomSheets from '@/components/BottomSheets'

import {
    useStateAllTransactions,
} from '@/services/useStateAllTransactions'

import { Ionicons } from '@expo/vector-icons'

import { router } from 'expo-router'

export default function PartialTransactions() {
    const {
        searchQuery,
        setSearchQuery,
        filterMonth,
        setFilterMonth,
        availableMonths,
        MONTH_NAMES,
        isMonthSheetOpen,
        setIsMonthSheetOpen,
        records,
        filtered,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useStateAllTransactions({ initialFilterPaymentStatus: 'partial' })

    const sectionStats = useMemo(() => {
        const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0)
        const count = filtered.length
        const avg = count > 0 ? totalAmount / count : 0
        return { totalAmount, count, avg }
    }, [filtered])

    if (isLoading && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-3 text-gray-500">Memuat transaksi partial...</Text>
            </View>
        )
    }

    if (error && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 px-5 justify-center">
                <View className="bg-white rounded-2xl p-6 border border-gray-100">
                    <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center self-center mb-4">
                        <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
                    </View>
                    <Text className="text-center text-gray-900 font-semibold text-base">Gagal memuat transaksi</Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                    <Pressable onPress={() => refetch()} className="mt-6 bg-[#7C3AED] py-3 rounded-2xl active:opacity-80">
                        <Text className="text-center text-white font-semibold">Coba lagi</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-white">
            <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={22} color="#374151" />
                    </Pressable>
                    <Text className="flex-1 ml-3 text-lg font-bold text-gray-900">Pembayaran Sebagian</Text>
                </View>
                <View className="mt-4 flex-row gap-3">
                    <View className="relative flex-1">
                        <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Cari nama atau no. transaksi..."
                            placeholderTextColor="#9CA3AF"
                            className="pl-12 pr-12 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900"
                            style={{ fontSize: 14 }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setSearchQuery('')}
                                className="absolute right-4 top-0 bottom-0 justify-center"
                            >
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setIsMonthSheetOpen(true)}
                        className="px-3 py-3 rounded-2xl border border-gray-200 bg-white flex-row items-center"
                    >
                        <Ionicons name="calendar-outline" size={18} color="#374151" />
                        <Text className="text-sm font-medium text-gray-700 ml-1.5">Tanggal</Text>
                        {filterMonth !== 'all' && (
                            <View className="ml-1.5 w-2 h-2 rounded-full bg-[#7C3AED]" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <BottomSheets
                visible={isMonthSheetOpen}
                onClose={() => setIsMonthSheetOpen(false)}
                title="Filter Tanggal"
            >
                <View className="pb-6">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            setFilterMonth('all')
                            setIsMonthSheetOpen(false)
                        }}
                        className={`py-4 border-b border-gray-100 flex-row items-center justify-between ${filterMonth === 'all' ? 'bg-gray-50' : ''}`}
                    >
                        <View className="flex-row items-center">
                            <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={filterMonth === 'all' ? '#7C3AED' : '#6B7280'}
                                />
                            </View>
                            <Text className={`font-medium ${filterMonth === 'all' ? 'text-gray-900' : 'text-gray-600'}`}>
                                Semua Tanggal
                            </Text>
                        </View>
                        {filterMonth === 'all' && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                    </TouchableOpacity>
                    {availableMonths.map((ym) => {
                        const [y, m] = ym.split('-')
                        const monthLabel = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
                        return (
                            <TouchableOpacity
                                key={ym}
                                activeOpacity={0.8}
                                onPress={() => {
                                    setFilterMonth(ym)
                                    setIsMonthSheetOpen(false)
                                }}
                                className={`py-4 border-b border-gray-100 flex-row items-center justify-between ${filterMonth === ym ? 'bg-gray-50' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                        <Ionicons
                                            name="calendar"
                                            size={20}
                                            color={filterMonth === ym ? '#7C3AED' : '#6B7280'}
                                        />
                                    </View>
                                    <Text className={`font-medium ${filterMonth === ym ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {monthLabel}
                                    </Text>
                                </View>
                                {filterMonth === ym && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </BottomSheets>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={['#7C3AED']} />
                }
            >
                <View className="mb-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <View className="flex-row">
                        <View className="w-1.5 bg-amber-500" />
                        <View className="flex-1 px-5 py-5">
                            <Text className="text-xs tracking-widest text-gray-400 font-bold">
                                RINGKASAN PEMBAYARAN SEBAGIAN
                                {(filterMonth !== 'all' || searchQuery.trim()) ? ' (FILTER)' : ''}
                            </Text>
                            <Text className="mt-2 text-2xl font-extrabold text-gray-900">
                                Rp {Math.round(sectionStats.totalAmount).toLocaleString('id-ID')}
                            </Text>
                            <View className="mt-4 flex-row gap-3">
                                <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                                    <Text className="text-xs text-gray-500">Jumlah Transaksi</Text>
                                    <Text className="mt-1 text-xl font-bold text-gray-900">
                                        {sectionStats.count}
                                    </Text>
                                </View>
                                <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                                    <Text className="text-xs text-gray-500">Rata-rata</Text>
                                    <Text className="mt-1 text-xl font-bold text-gray-900">
                                        Rp {Math.round(sectionStats.avg).toLocaleString('id-ID')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {filtered.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-amber-50 items-center justify-center mb-4">
                            <Ionicons
                                name="pricetag-outline"
                                size={32}
                                color="#D97706"
                            />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">
                            {searchQuery.trim() || filterMonth !== 'all'
                                ? 'Tidak ada transaksi yang sesuai'
                                : 'Belum ada pembayaran sebagian'}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            {searchQuery.trim() || filterMonth !== 'all'
                                ? 'Ubah pencarian atau filter tanggal'
                                : 'Transaksi dengan pembayaran sebagian akan muncul di sini'}
                        </Text>
                    </View>
                ) : (
                    filtered.map((r) => (
                        <TouchableOpacity
                            key={r.id}
                            activeOpacity={0.85}
                            onPress={() => router.push(`/transactions/${r.id}` as const)}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4"
                        >
                            <View className="px-5 pt-5">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-row items-center flex-1 pr-3">
                                        <View className="w-12 h-12 rounded-2xl bg-amber-50 items-center justify-center">
                                            <Ionicons name="person-outline" size={18} color="#D97706" />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                                {r.customerName}
                                            </Text>
                                            <Text className="text-xs text-gray-400 mt-0.5">
                                                {r.orderCode} • {r.time}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-base font-extrabold text-amber-600">
                                            Rp {Math.round(r.amount).toLocaleString('id-ID')}
                                        </Text>
                                        <View className="mt-2">
                                            <StatusPill status={r.status} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View className="mt-4 px-5 pb-5">
                                <View className="h-[1px] bg-gray-100" />
                                <View className="flex-row items-center justify-between mt-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 items-center justify-center">
                                            {r.paymentMethodLabel.toUpperCase() === 'CASH' ? (
                                                <Ionicons name="cash-outline" size={24} color="#D97706" />
                                            ) : r.paymentMethodLabel.toUpperCase() === 'KASBON' ? (
                                                <Ionicons name="receipt-outline" size={24} color="#D97706" />
                                            ) : (
                                                <Text className="text-lg font-extrabold text-amber-700">
                                                    {r.paymentMethodLabel.toUpperCase().slice(0, 3)}
                                                </Text>
                                            )}
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-base font-extrabold text-gray-900">
                                                {r.paymentMethodLabel}
                                            </Text>
                                            <Text className="text-xs text-amber-600 mt-0.5">
                                                Pembayaran sebagian
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-sm font-semibold text-gray-500 mr-1">Detail</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    )
}
